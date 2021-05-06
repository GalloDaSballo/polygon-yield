// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "hardhat/console.sol";
import { ERC20 } from "./aave/lib/ERC20.sol";
import { SafeERC20 } from "./aave/lib/SafeERC20.sol";
import { SafeMath } from "./aave/lib/SafeMath.sol";
import { IERC20 } from "./aave/interfaces/IERC20.sol";
import { Ownable } from "./aave/lib/Ownable.sol";
import { ReentrancyGuard } from "./aave/lib/ReentrancyGuard.sol";
import { ILendingPool } from "./aave/interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./aave/interfaces/ILendingPoolAddressesProvider.sol";
import { IProtocolDataProvider } from "./aave/interfaces/IProtocolDataProvider.sol";
import { IAaveIncentivesController } from "./aave/interfaces/IAaveIncentivesController.sol";
import { IPriceOracle } from "./aave/interfaces/IPriceOracle.sol";


// NOTE: onlyOwner in deposit and withdraw to prevent people from using this

contract MyieldWMatic is ERC20, Ownable, ReentrancyGuard {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  //Asset we want and we invest WMATIC
  address public constant want = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 ; 

  address public constant LENDING_POOL = 0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf;

  uint256 public constant PRECISION = 1 * 10 ** 18; // PRECISION.mul(w/e).div(PRECISION) to avoid rounding

  uint256 public constant MAX_BPS = 10000;

  uint256 public constant MIN_HEALTH = 1300000000000000000; // 1.3

  address public constant ADDRES_PROVIDER = 0xd05e3E715d945B59290df0ae8eF85c1BdB684744;

  address public constant MATIC_REWARDS = 0x357D51124f59836DeD84c8a1730D72B749d8BC23;

  address public strategist = msg.sender; // Used to Rebalance Pools

  address public feeRecipient = msg.sender; // Treasury

  uint256 public feeBps = 500; // Starts at 5% can be changed by governance

  event Deposit(address indexed account, uint256 amount, uint256 shares);
  event Withdraw(address indexed account, uint256 value, uint256 shares);
  event Harvest(uint256 rewardsAmount, uint256 fees);


  modifier onlyManagement() {
    require(msg.sender == owner() || msg.sender == strategist, "Not in Management");
    _;
  }


  constructor() ERC20("MyYield WMATIC Vault With Events", "MyYieldWMATIC", 18) {
    // Approve for deposits
    IERC20(want).safeApprove(LENDING_POOL, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
  }

  /** Setters */
  function setStrategist(address newStrategist) public onlyOwner () {
    strategist = newStrategist;
  }

  function setFeeRecipient(address newFeeRecipient) public onlyOwner () {
    feeRecipient = newFeeRecipient;
  }

    function setFeeBps(uint256 newFeeBps) public onlyOwner () {
    feeBps = newFeeBps;
  }

  /** Deposit */
  function fromDepositToShares(uint256 amount) public view returns (uint256){
    return PRECISION.mul(amount).mul(totalSupply()).div(getTotalValue()).div(PRECISION);
  }

  // Deposit want into the pool and mint corresponding pool ownership tokens
  function deposit(uint256 amount) public nonReentrant returns (uint256) {
    uint256 shares = 0;

    if(totalSupply() == 0){
      shares = amount;
    } else {
      shares = fromDepositToShares(amount);
    }
    _mint(msg.sender, shares);


    IERC20(want).safeTransferFrom(msg.sender, address(this), amount);
    ILendingPool(LENDING_POOL).deposit(want, amount, address(this), 0);

    emit Deposit(msg.sender, amount, shares);
    return shares;
  }

  /** Withdrawals */
  function fromSharesToWithdrawal(uint256 shares) public view returns (uint256){
    return PRECISION.mul(shares).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
  }

  // Return value based as percentage of total value
  function withdraw(uint256 shares) public nonReentrant returns (uint256) {
    // From deposited to withdraw amount
    uint256 value = fromSharesToWithdrawal(shares);

     // amount / total is percent owned. Multiply that by total value to get value they want to withdraw
    _burn(msg.sender, shares);

    // Remove from POOL or you loose money
    if(balanceOfWant() < value) {
      // Withdraw enough want from aave so we can give it to the customer
      _divestFromAAVE(value);
    }

    uint256 max = balanceOfWant();
    
    if(value > max){
      value = max;
      // We can only send max, no need to rebalance
      IERC20(want).safeTransfer(msg.sender, value);
    } else {
      IERC20(want).safeTransfer(msg.sender, value);
      // Have them rebalane and re-deposit
      depositAll();
      _rebalance();
    }

    emit Withdraw(msg.sender, value, shares); 
    return value;
  }

  /** AAVE based View Methods */
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

  /** Rebalance = Invest to maximize yield */
  function rebalance() public onlyManagement {
    _rebalance();
  }

  // Rebalance after deposits
  function _rebalance() internal {
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

  
  /** Divest = Remove from AAVE */
  // For forced withdrawals
  function divestFromAAVE(uint256 amount) public onlyManagement {
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

  // For admin forced divesting from AAVE
  function withdrawStepFromAAVE(uint256 canRepay) public onlyManagement {
    _withdrawStepFromAAVE(canRepay);
  }

  /** Reinvest Rewards, normally called Harvest */
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

  function reinvestRewards() public {
    address dataProvider = ILendingPoolAddressesProvider(ADDRES_PROVIDER).getAddress("0x1");
    (address aToken, , address variableDebt) = IProtocolDataProvider(dataProvider).getReserveTokensAddresses(want);
    address[] memory list = new address[](2);
    list[0] = aToken;
    list[1] = variableDebt;

    uint256 totalRewards = IAaveIncentivesController(MATIC_REWARDS).getRewardsBalance(list, address(this));


    IAaveIncentivesController(MATIC_REWARDS).claimRewards(
      list, 
      totalRewards,
      address(this)
    );

    uint256 fees = PRECISION.mul(totalRewards).mul(feeBps).div(MAX_BPS).div(PRECISION);
    IERC20(want).safeTransfer(feeRecipient, fees);
    emit Harvest(totalRewards, fees);

    // If you want to receive a performance fee, this is where

    // Reinvest
    ILendingPool(LENDING_POOL).deposit(want, totalRewards.sub(fees), address(this), 0);
  }


  /** Basic AAVE Methods */
  function withdrawFromAAVE(uint256 amount) public onlyManagement {
    ILendingPool(LENDING_POOL).withdraw(want, amount, address(this));
  }

  function repayAAVE(uint256 amount) public onlyManagement {
    ILendingPool(LENDING_POOL).repay(want, amount, 2, address(this));
  }

  // Deposit in aave pool in case funds are not being invested
  function depositAll() public {
    uint256 balance = balanceOfWant();
    if(balance > 0) {
      ILendingPool(LENDING_POOL).deposit(want, balance, address(this), 0);
    } 
  }

  /** UNSAFE METHODS */
  // Used mostly as safety mechanism in case some other operations goes wrong
  function rug(address asset, address destination) public onlyOwner nonReentrant returns (uint256){
    uint256 amount = IERC20(asset).balanceOf(address(this));
    IERC20(asset).safeTransfer(destination, amount);

    return amount;
  }
}
