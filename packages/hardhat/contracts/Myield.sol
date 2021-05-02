// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "hardhat/console.sol";
import { ERC20 } from "./aave/lib/ERC20.sol";
import { SafeMath } from "./aave/lib/SafeMath.sol";
import { IERC20 } from "./aave/interfaces/IERC20.sol";
import { Ownable } from "./aave/lib/Ownable.sol";
import { ILendingPool } from "./aave/interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./aave/interfaces/ILendingPoolAddressesProvider.sol";
import { IProtocolDataProvider } from "./aave/interfaces/IProtocolDataProvider.sol";
import { IAaveIncentivesController } from "./aave/interfaces/IAaveIncentivesController.sol";
import { IPriceOracle } from "./aave/interfaces/IPriceOracle.sol";


// NOTE: onlyOwner in deposit and withdraw to prevent people from using this

contract Myield is ERC20, Ownable {

  using SafeMath for uint256;

  //Asset we want and we invest WMATIC
  address public constant want = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 ; 

  // TODO
  address public constant LENDING_POOL = 0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf; // Address of lending pool

  uint256 public constant PRECISION = 1 * 10 ** 18; // PRECISION.mul(w/e).div(PRECISION) to avoid rounding

  uint256 public constant MIN_HEALTH = 1300000000000000000; // 1.3

  address public constant ADDRES_PROVIDER = 0xd05e3E715d945B59290df0ae8eF85c1BdB684744;

  address public constant MATIC_REWARDS = 0x357D51124f59836DeD84c8a1730D72B749d8BC23;

  constructor() public ERC20("MyYield WMATIC Vault", "MyWMATIC", 18) {
    // Approve for deposits
    IERC20(want).approve(LENDING_POOL, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
  }

  function fromDepositToShares(uint256 amount) public view returns (uint256){
    return PRECISION.mul(amount).mul(totalSupply()).div(getTotalValue()).div(PRECISION);
  }

  // Deposit want into the pool and mint corresponding pool ownership tokens
  function deposit(uint256 amount) public returns (uint256) {
    if(totalSupply() == 0){
      _mint(msg.sender, amount);
    } else {
      uint256 value = fromDepositToShares(amount);
      _mint(msg.sender, value);
    }

    IERC20(want).transferFrom(msg.sender, address(this), amount);
    ILendingPool(LENDING_POOL).deposit(want, amount, address(this), 0);
  }

  function fromSharesToWithdrawal(uint256 amount) public view returns (uint256){
    return PRECISION.mul(amount).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
  }

  // Return value based as percentage of total value
  function withdraw(uint256 amount) public returns (uint256) {
    // From deposited to withdraw amount
    uint256 value = fromSharesToWithdrawal(amount);

     // amount / total is percent owned. Multiply that by total value to get value they want to withdraw
    _burn(msg.sender, amount);

    // Remove from POOL or you loose money
    if(balanceOfWant() < value) {
      // Withdraw enough want from aave so we can give it to the customer
      _divestFromAAVE(value);
    }

    uint256 max = balanceOfWant();
    
    if(value > max){
      // We can only send max, no need to rebalance
      IERC20(want).transfer(msg.sender, max);
    } else {
      IERC20(want).transfer(msg.sender, value);
      // Have them rebalane and re-deposit
      depositAll();
      rebalance();
    }

    return value;
  }

  
  function getTotalValue() public view returns (uint256) {
    // Sum up amount that is deposited - owed - fees
    return balanceOfWant().add(deposited()).sub(owed());
  }

  function balanceOfWant() public view returns (uint256) {
    return IERC20(want).balanceOf(address(this));
  }

    // Oracle rate, ETH Rate for want
  function getRate() public view returns (uint256){
    // Get the oracle
    address oracleAddress = ILendingPoolAddressesProvider(ADDRES_PROVIDER).getPriceOracle();

    // Ask the price to the oracle
    return IPriceOracle(oracleAddress).getAssetPrice(want);
  }

  // How much we deposited in aave in want
  function deposited() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(LENDING_POOL).getUserAccountData(address(this));

    return PRECISION.mul(totalCollateralETH).mul(10**18).div(getRate()).div(PRECISION);
  }

  // How much we owe to aave in want
  function owed() public view returns (uint256) {
    (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) = ILendingPool(LENDING_POOL).getUserAccountData(address(this));

    return PRECISION.mul(totalDebtETH).mul(10**18).div(getRate()).div(PRECISION);
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
    ) = ILendingPool(LENDING_POOL).getUserAccountData(address(this));

    // We borrow only if we are above MIN_HEALTH
    if(healthFactor > MIN_HEALTH) {
      // 95% of converted to want from Eth
      uint256 maxValue = PRECISION.mul(availableBorrowsETH).mul(95).div(100).div(PRECISION);

      // 18 decimals
      return PRECISION.mul(maxValue).mul(10**18).div(getRate()).div(PRECISION);
    }

    return 0;
  }


  // Rebalance after deposits
  function rebalance() public {
    // Loop on it until it's properly done
    uint256 max_iterations = 5;
    for(uint256 i = 0; i < max_iterations; i++){
      uint256 toBorrow = canBorrow();
      if(toBorrow > 0) {
        ILendingPool(LENDING_POOL).borrow(want, toBorrow, 2, 0, address(this));
        ILendingPool(LENDING_POOL).deposit(want, toBorrow, address(this), 0);
      } 
        else {
        return;
      }
    }
    //NOTE: The contract is not aware of rewards currently
    // I.e this will auto farm but you have to withdraw as soon as rewards 
    // are less than interest for borrowing or you'll be effectively loosing money
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
    ) = ILendingPool(LENDING_POOL).getUserAccountData(address(this));

    uint256 deposited = totalCollateralETH;
    uint256 owed = totalDebtETH;

    if(owed == 0){
      return uint(-1); //You have repaid all
    }

    uint256 diff = deposited.sub(PRECISION.mul(owed).mul(10000).div(currentLiquidationThreshold).div(PRECISION));
    uint256 inWant = PRECISION.mul(diff).mul(10**18).div(getRate()).mul(95).div(100).div(PRECISION); // Take 95% just to be safe
    
    return inWant;
  }

  // For forced withdrawals
  function divestFromAAVE(uint256 amount) public onlyOwner {
    _divestFromAAVE(amount);
  }

  // For withdrawing your funds
  function _divestFromAAVE(uint256 amount) internal {
    // TODO: Make this more efficient and avoid withdrawing all for no reason
    require(amount <= getTotalValue(), "Cannot withdraw more than totalValue");
    
    uint256 current = balanceOfWant();
    uint256 repayAmount = canRepay(); // The "unsafe" (below target health) you can withdraw

    // Loop to withdraw until you have the amount you need
    while(current < amount && repayAmount != uint(-1)){
      _withdrawStepFromAAVE(repayAmount);
      current = balanceOfWant();
      repayAmount = canRepay();
    }

    // Withdraw the rest here
    ILendingPool(LENDING_POOL).withdraw(want, type(uint).max, address(this));
  }


  //Take 95% of withdrawable, use that to repay AAVE
  function _withdrawStepFromAAVE(uint256 canRepay) internal {
    if(canRepay > 0){
      //Repay this step
        ILendingPool(LENDING_POOL).withdraw(want, canRepay, address(this));
        ILendingPool(LENDING_POOL).repay(want, canRepay, 2, address(this));
    }
  }

  // For admin forced withdrawals
  function withdrawStepFromAAVE(uint256 canRepay) public onlyOwner {
    _withdrawStepFromAAVE(canRepay);
  }

  function reinvestRewards() public {
    address dataProvider = ILendingPoolAddressesProvider(ADDRES_PROVIDER).getAddress("0x1");
    (address aToken, , address variableDebt) = IProtocolDataProvider(dataProvider).getReserveTokensAddresses(want);
    address[] memory list = new address[](2);
    list[0] = aToken;
    list[1] = variableDebt;

    IAaveIncentivesController(MATIC_REWARDS).claimRewards(
      list, 
      type(uint).max,
      address(this)
    );

    // Reinvest
    ILendingPool(LENDING_POOL).deposit(want, balanceOfWant(), address(this), 0);
  }

    // Copy pasted for debugging / Visibility
  function getRewardsBalance() public view returns (uint256) {
    address dataProvider = ILendingPoolAddressesProvider(ADDRES_PROVIDER).getAddress("0x1");
    (address aToken, , address variableDebt) = IProtocolDataProvider(dataProvider).getReserveTokensAddresses(want);
    address[] memory list = new address[](2);
    list[0] = aToken;
    list[1] = variableDebt;
    
    uint256 totalRewards = IAaveIncentivesController(MATIC_REWARDS).getRewardsBalance(list, address(this));
    return totalRewards;
  }

    /** Basic AAVE Methods */
  function withdrawFromAAVE(uint256 amount) public onlyOwner { 
    ILendingPool(LENDING_POOL).withdraw(want, amount, address(this));
  }

  function repayAAVE(uint256 amount) public onlyOwner { 
    ILendingPool(LENDING_POOL).repay(want, amount, 2, address(this));
  }

  // Deposit in aave pool in case funds are not being invested
  function depositAll() public { 
    uint256 balance = balanceOfWant();
    if(balance > 0) {
      ILendingPool(LENDING_POOL).deposit(want, balance, address(this), 0);
    } 
  }



  // For now we'll rug assets as we please
  function rug(address asset, address destination) public onlyOwner returns (uint256){
    uint256 amount = IERC20(asset).balanceOf(address(this));
    IERC20(asset).transfer(destination, amount);

    return amount;
  }
}
