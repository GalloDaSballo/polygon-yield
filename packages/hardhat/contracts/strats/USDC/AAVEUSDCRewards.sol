// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "hardhat/console.sol";
import { ERC20 } from "../../aave/lib/ERC20.sol";
import { SafeERC20 } from "../../aave/lib/SafeERC20.sol";
import { SafeMath } from "../../aave/lib/SafeMath.sol";
import { IERC20 } from "../../aave/interfaces/IERC20.sol";
import { Ownable } from "../../aave/lib/Ownable.sol";
import { ReentrancyGuard } from "../../aave/lib/ReentrancyGuard.sol";
import { IUniswapV2Router02 } from "../../uniswap/IUniswapV2Router02.sol";

import { IStrategy } from "../../IStrategy.sol";
import { IVault } from "../../IVault.sol";

import { ILendingPool } from "../../aave/interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../aave/interfaces/ILendingPoolAddressesProvider.sol";
import { IProtocolDataProvider } from "../../aave/interfaces/IProtocolDataProvider.sol";
import { IAaveIncentivesController } from "../../aave/interfaces/IAaveIncentivesController.sol";
import { IPriceOracle } from "../../aave/interfaces/IPriceOracle.sol";

contract AAVEUSDCRewards is IStrategy, Ownable, ReentrancyGuard {
  
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Based Strat
  address public override immutable want;
  address public immutable aToken;
  address public immutable vToken;
  uint256 public immutable decimals;
  address public immutable vault;

  uint256 public constant MAX_BPS = 10000;

  // Strat Specific
  address public immutable lendingPool;
  address public immutable addressProvider; // 0xd05e3E715d945B59290df0ae8eF85c1BdB684744;

  address public constant MATIC_REWARDS = 0x357D51124f59836DeD84c8a1730D72B749d8BC23;
  address public immutable rewards; // Token for rewards
  uint256 public immutable rewardsDecimals;



  uint256 public minHealth; // 1.3 with 18 decimals
  address public swapRouter = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506; // Router


  // Strategy settings
  uint256 public minRebalanceAmount = 500000000000000000; // 0.5 should be changed based on decimals
  address public strategist;

  uint256 public feedDecimals = 18; // Some chainlink feeds have less decimals
  


  // Modifiers
  modifier onlyManagement() {
    require(msg.sender == owner() || msg.sender == strategist, "Not in Management");
    _;
  }

  modifier onlyVault() {
    require(msg.sender == vault, "Only Vault can Withdraw");
    _;
  }


  constructor(address _want, address _vault, address _lendingPool, address _addressProvider, uint256 _minHealth, address _rewards) 
  {
    want = _want;
    vault = _vault;
    lendingPool = _lendingPool;
    addressProvider = _addressProvider;
    
    rewards = _rewards;
    uint256 _rewardsDecimals = ERC20(_rewards).decimals();
    rewardsDecimals = _rewardsDecimals;

    address dataProvider = ILendingPoolAddressesProvider(_addressProvider).getAddress("0x1");
    (address _aToken, , address _vToken) = IProtocolDataProvider(dataProvider).getReserveTokensAddresses(_want);

    aToken = _aToken;
    vToken = _vToken;

    uint256 _decimals = ERC20(_want).decimals();
    decimals =_decimals;

    minHealth = _minHealth;

    IERC20(_want).approve(_lendingPool, uint256(-1));
    IERC20(_want).approve(_vault, uint256(-1));
  }

  // Setters
  function setStrategist(address newStrategist) external onlyOwner {
    strategist = newStrategist;
  }

  function setRebalanceAmount(uint256 newRebalanceAmount) external onlyManagement {
    minRebalanceAmount = newRebalanceAmount;
  }

  function setFeedDecimals(uint256 newFeedDecimals) external onlyManagement {
    feedDecimals = newFeedDecimals;
  }

  function setMinHealth(uint256 newMinHealth) external onlyManagement {
    minHealth = newMinHealth;
  }

  /** IStrategy */
  // Deposit new Principal
  function deposit(uint256 amount) external onlyManagement override returns (uint256) {
    // Get from vault
    IERC20(want).safeTransferFrom(vault, address(this), amount);
    _depositInPool();
  }

  // Withdraw X Principal
  function withdraw(uint256 amount) external onlyVault override returns (uint256) {
    _divest();
    if(amount < balanceOfWant()){
      IERC20(want).safeTransfer(vault, amount);
      _depositInPool(); // Redeposit since there's some left
    } else {
      IERC20(want).safeTransfer(vault, balanceOfWant());
    }
  }

  //  Earns rewards, repays debt, reinvest rewards
  // cachedRewardToWantRatio could be changed to a Chainlink feed
  function harvest(uint256 cachedRewardToWantRatio) external override onlyManagement {
    address[] memory list = new address[](2);
    list[0] = aToken;
    list[1] = vToken;

    // value in rewards
    uint256 totalRewards = IAaveIncentivesController(MATIC_REWARDS).getRewardsBalance(list, address(this));


    IAaveIncentivesController(MATIC_REWARDS).claimRewards(
      list, 
      totalRewards,
      address(this)
    );


    // Swap ToRewards, Pay Debt
    uint256 wantEarned = _swapRewardsToWant(totalRewards, cachedRewardToWantRatio);

    // Pay off any debt
    // Debt is equal to negative of canBorrow
    uint256 toRepay = debtBelowHealth();
    uint256 repaid = toRepay >= wantEarned ? wantEarned : toRepay;
    uint256 earned = wantEarned.sub(repaid);
    if(toRepay > 0){
      ILendingPool(lendingPool).repay(want, repaid, 2, address(this));
    }

    // Report earnings to Vault
    IVault(vault).reportHarvest(earned);

    // Reinvest
    _depositInPool();
  }

  // Repay debt
  // balanceOfWant is always 0 (because we always deposit)
  // As such it should be used either for testing or when in dire straits after manually removing for aave
  function repayDebt() public onlyManagement {
    // Pay off any debt
    // Debt is equal to negative of canBorrow
    uint256 toRepay = debtBelowHealth();
    uint256 wantBalance = balanceOfWant();
    uint256 repaid = toRepay >= wantBalance ? wantBalance : toRepay;
    if(toRepay > 0){
      ILendingPool(lendingPool).repay(want, repaid, 2, address(this));
    }
  }


  // Mostly for testing
  function swapRewardsToWant(uint256 amount, uint256 ratio) public onlyManagement returns (uint256) {
    return _swapRewardsToWant(amount, ratio);
  }

  function _swapRewardsToWant(uint256 amount, uint256 ratio) internal returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = rewards;
    path[1] = want;

    IERC20(rewards).safeApprove(swapRouter, amount);
    uint256[] memory amounts = IUniswapV2Router02(swapRouter).swapExactTokensForTokens(
        amount,
        getMinOutputAmount(amount, ratio),
        path,
        address(this),
        block.timestamp
    );

    // Return the output from swap
    return amounts[1];
  }

  function getRewardsAmount() public view returns (uint256) {
    address[] memory list = new address[](2);
    list[0] = aToken;
    list[1] = vToken;

    // value in rewards
    uint256 totalRewards = IAaveIncentivesController(MATIC_REWARDS).getRewardsBalance(list, address(this));
    return totalRewards;
  }

  function getMinOutputAmount(uint256 amount, uint256 ratio) public view returns (uint256) {
    // Amount is in 18 decimals, I need to convert it to 6 decimals
    uint256 amountMin = amount.mul(10 ** feedDecimals).div(ratio).mul(99).div(100); // 99% of converted from cached ratio

    // Based on decimals difference we either need to multiply or divide the result
    // Could be generalized for other strats
    if(decimals < rewardsDecimals) {
      amountMin = amountMin.div(10 ** (rewardsDecimals.sub(decimals)));
    }

    if(decimals > rewardsDecimals) {
      amountMin = amountMin.mul(10 ** (decimals.sub(rewardsDecimals)));
    }

    return amountMin;
  }

  function balanceOfWant() public override view returns (uint256) {
    return IERC20(want).balanceOf(address(this));
  }

  function getTotalValue() public override view returns (uint256) {
    // Sum up amount that is deposited - owed - fees
    return balanceOfWant().add(deposited()).sub(owed());
  }

  // How much we deposited in aave in want
  function deposited() public view returns (uint256) {
    return IERC20(aToken).balanceOf(address(this));
  }

  // How much we owe to aave in want
  function owed() public view returns (uint256) {
    return IERC20(vToken).balanceOf(address(this));
  }


  /** AAVE View Functions **/
  // Stats
  function stats() public view returns (uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor) {
    (
      totalCollateralETH,
      totalDebtETH,
      availableBorrowsETH,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    ) = ILendingPool(lendingPool).getUserAccountData(address(this));
  }


  // How much more can we borrow in want, return 0 if below MIN_HEALTH
  function canBorrow() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(lendingPool).getUserAccountData(address(this));

    if(healthFactor > minHealth) {
      // Amount = ((Deposited * itv) / MIN_HEALTH) - owed
      //10 ** 18 because minHealth is in 10^18
      // Div MAX_BPS because because ltv / maxbps is the percent
      uint256 maxValue = deposited().mul(ltv).mul(10 ** 18).div(minHealth).div(MAX_BPS).sub(owed());

      return maxValue;
    }

    return 0;
  }

  // What should we repay?
  function debtBelowHealth() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(lendingPool).getUserAccountData(address(this));

    if(healthFactor < minHealth) {
      // How much did we go off of minHealth?
      uint256 maxBorrow = deposited().mul(ltv).mul(10 ** 18).div(minHealth).div(MAX_BPS);
      uint256 maxValue = owed().sub(maxBorrow);

      return maxValue;
    }

    return 0;
  }

  // returns 95% of the collateral we can withdraw from aave, used to loop and repay debts
  function canRepay() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(lendingPool).getUserAccountData(address(this));

    uint256 aBalance = deposited();
    uint256 vBalance = owed();

    if(vBalance == 0){
      return uint(-1); //You have repaid all
    }

    uint256 diff = aBalance.sub(vBalance.mul(10000).div(currentLiquidationThreshold));
    uint256 inWant = diff.mul(95).div(100); // Take 95% just to be safe
    
    return inWant;
  }

  // Retrieve the health factor
  function currentHealthFactor() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(lendingPool).getUserAccountData(address(this));

    return healthFactor;
  }


  // Deposit in the pool to earn basic interest
  function _depositInPool() internal {
    uint256 amount = balanceOfWant();
    if(amount > 0) {
      ILendingPool(lendingPool).deposit(want, amount, address(this), 0);
    }
    
  }

  // These are here because our stats have to be managed
  function invest() external override onlyManagement {
    _invest();
  }
  function _invest() internal {
    // Loop on it until it's properly done
    uint256 max_iterations = 5;
    for(uint256 i = 0; i < max_iterations; i++){
      uint256 toBorrow = canBorrow();
      if(toBorrow > 0) {
        ILendingPool(lendingPool).borrow(want, toBorrow, 2, 0, address(this));
        ILendingPool(lendingPool).deposit(want, toBorrow, address(this), 0);
      } 
        else {
        return;
      }
    }
  }

  function divest() external override onlyManagement {
    _divest();
  }


  function _divest() internal {
    _divestFromAAVE();
  }

  // Divest all from AAVE, awful gas, but hey, it works
  function _divestFromAAVE() internal {    
    uint256 repayAmount = canRepay(); // The "unsafe" (below target health) you can withdraw

    // Loop to withdraw until you have the amount you need
    while(repayAmount != uint(-1)){
      _withdrawStepFromAAVE(repayAmount);
      repayAmount = canRepay();
    }
    if(deposited() > 0){
      // Withdraw the rest here
      ILendingPool(lendingPool).withdraw(want, type(uint).max, address(this));
    }
  }


  //Take 95% of withdrawable, use that to repay AAVE
  function _withdrawStepFromAAVE(uint256 canRepay) internal {
    if(canRepay > 0){
      //Repay this step
        ILendingPool(lendingPool).withdraw(want, canRepay, address(this));
        ILendingPool(lendingPool).repay(want, canRepay, 2, address(this));
    }
  }

  // For admin forced divesting from AAVE
  function withdrawStepFromAAVE(uint256 canRepay) public onlyManagement {
    _withdrawStepFromAAVE(canRepay);
  }

  // These are here because our stats have to be managed
  function shouldInvest() external view  override onlyManagement returns (bool) {
    // Get balance of debt (in aave want), get balance of credit (in aave want)
    // Calculate health factor
    // If health factor above X and enough liquidity, return true
    return canBorrow() > minRebalanceAmount;
  }
  function shouldDivest() external view override onlyManagement returns (bool) {
    // Get balance of debt (in aave want), get balance of credit (in aave want)
    // Calculate health factor
    // If health factor below X return true
    return currentHealthFactor() < minHealth;
  }
}