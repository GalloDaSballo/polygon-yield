// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "hardhat/console.sol";
import { ERC20 } from "./aave/lib/ERC20.sol";
import { SafeERC20 } from "./aave/lib/SafeERC20.sol";
import { SafeMath } from "./aave/lib/SafeMath.sol";
import { IERC20 } from "./aave/interfaces/IERC20.sol";
import { Ownable } from "./aave/lib/Ownable.sol";
import { ReentrancyGuard } from "./aave/lib/ReentrancyGuard.sol";

import { IVault } from "./IVault.sol";
import { IStrategy } from "./IStrategy.sol";

contract MyieldVault is IVault, ERC20, Ownable, ReentrancyGuard {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  address public immutable want; // You can only ever deposit want

  uint256 public constant PRECISION = 1 * 10 ** 18; // PRECISION.mul(w/e).div(PRECISION) to avoid rounding

  uint256 public constant MAX_BPS = 10000;

  uint256 public feeBps = 500; // Starts at 5% can be changed by governance

  address public treasury = msg.sender; // Treasury

  bool public paused = false;

  address[] public strategies;

  event Deposit(address indexed account, uint256 amount, uint256 shares);
  event Withdraw(address indexed account, uint256 value, uint256 shares);
  event Harvest(uint256 rewardsAmount, uint256 fees);

  modifier notPaused() {
    require(!paused, "Contract is Paused");
    _;
  }

  modifier onlyStrat() {
    bool found = false;
    for(uint256 x = 0; x < strategies.length; x++){
      if(strategies[x] == msg.sender){
        found = true;
      }
    }
    require(found, "Only Strategies!");
    _;
  }


  constructor(address _want) 
    ERC20(
    string(abi.encodePacked("Myield ", ERC20(_want).name(), " Vault")), 
    string(abi.encodePacked("MyYield", ERC20(_want).symbol())), ERC20(_want).decimals())
  {
    want = _want;
  }

  /** Setters */
  function setTreasury(address newTreasury) public onlyOwner {
    treasury = newTreasury;
  }

  function setFeeBps(uint256 newFeeBps) public onlyOwner {
    feeBps = newFeeBps;
  }

  function addStrategy(address newStrat) public onlyOwner {
    require(IStrategy(newStrat).want() == want, "Strategy wrong want");
    IERC20(want).safeApprove(newStrat, uint256(-1));
    strategies.push(newStrat);
  }

  function removeStrategy(uint256 index) public onlyOwner {
    // Put strat from index to end, then remove
    strategies[index] = strategies[strategies.length - 1];
    IERC20(want).safeApprove(strategies[index], 0);
    strategies.pop();
  }

  // Management
  function setPaused(bool newPaused) public onlyOwner {
    paused = newPaused;
  }


  // The total value for the vault is the value we have + the value we invested in strats
  function getTotalValue() public view returns (uint256) {
    return balanceOfWant() + balanceInStrats();
  }

  function balanceOfWant() public view returns (uint256) {
    return IERC20(want).balanceOf(address(this));
  }

  function balanceInStrats() public view returns (uint256) {
    uint256 acc = 0;
    for(uint256 x = 0; x < strategies.length; x ++) {
      acc += IStrategy(strategies[x]).getTotalValue();
    }
    return acc;
  }


  /** Deposit */
  function fromDepositToShares(uint256 amount) public view returns (uint256) {
    return PRECISION.mul(amount).mul(totalSupply()).div(getTotalValue()).div(PRECISION);
  }

  // Deposit want into the vault
  function deposit(uint256 amount) public nonReentrant notPaused returns (uint256) {
    uint256 shares = 0;

    if(totalSupply() == 0){
      shares = amount;
    } else {
      shares = fromDepositToShares(amount);
    }
    IERC20(want).safeTransferFrom(msg.sender, address(this), amount);
    _mint(msg.sender, shares);

    emit Deposit(msg.sender, amount, shares);
    return shares;
  }

  /** Withdrawals */
  function fromSharesToWithdrawal(uint256 shares) public view returns (uint256) {
    return PRECISION.mul(shares).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
  }

  // Return value based as percentage of total value
  function withdraw(uint256 shares) public nonReentrant notPaused returns (uint256) {
    uint256 value = fromSharesToWithdrawal(shares);
    _burn(msg.sender, shares);

    // We need to withdraw from Strats
    if(balanceOfWant() < value) {
      // Iterate over strats
      for(uint256 x = 0; x < strategies.length; x ++) {
        uint256 loss = IStrategy(strategies[x]).withdraw(value);

        if(balanceOfWant() >= value) break; // Once we withdraw enough, let's stop
      }
    }

    uint256 max = balanceOfWant();

    if(value > max){
      value = max;
    }
    IERC20(want).safeTransfer(msg.sender, value);

    emit Withdraw(msg.sender, value, shares); 
    return value;
  }

  function reportHarvest(uint256 amount) external override onlyStrat {
    // Get fees and send them to treasury
    address callingStrat = msg.sender;
    uint256 fees = amount.mul(feeBps).div(MAX_BPS);
    // Take fees from Strat
    IERC20(want).safeTransferFrom(callingStrat, address(this), fees);
    // Send fees to treasury
    IERC20(want).safeTransfer(treasury, fees);

    emit Harvest(amount, fees);
  }
  // NOTE: Alternatively you could issue shares for the trasury absed on the fees value
  // Will probably do that in next iteration

  /** UNSAFE METHODS */
  // Used mostly as safety mechanism in case some other operations goes wrong
  function rug(address asset, address destination) public onlyOwner nonReentrant returns (uint256) {
    uint256 amount = IERC20(asset).balanceOf(address(this));
    IERC20(asset).safeTransfer(destination, amount);

    return amount;
  }
}
