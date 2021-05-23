// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "hardhat/console.sol";
import { ERC20 } from "./aave/lib/ERC20.sol";
import { SafeERC20 } from "./aave/lib/SafeERC20.sol";
import { SafeMath } from "./aave/lib/SafeMath.sol";
import { IERC20 } from "./aave/interfaces/IERC20.sol";
import { Ownable } from "./aave/lib/Ownable.sol";
import { ReentrancyGuard } from "./aave/lib/ReentrancyGuard.sol";

import { IUniswapV2Router02 } from "./uniswap/IUniswapV2Router02.sol";

import { IVault } from "./IVault.sol";
import { IStrategy } from "./IStrategy.sol";

contract MyieldDCAVault is IVault, ERC20, Ownable, ReentrancyGuard {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  address public immutable want; // You can only ever deposit want
  address public immutable need; // Need is what we dca into

  // Decimals, used for conversions
  uint256 public immutable needDecimals;
  uint256 public immutable wantDecimals;

  uint256 public feedDecimals = 18; // Some chainlink feeds have less decimals

  uint256 public toSwap = 0; // The Amount we'll swap in the next swap call, used to avoid swapping deposits and stuff

  address public swapRouter = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506; // Router //TODO: May want to be able to change

  address public strategist; // Strategist can swap to dca

  uint256 public constant PRECISION = 1 * 10 ** 18; // PRECISION.mul(w/e).div(PRECISION) to avoid rounding

  uint256 public constant MAX_BPS = 10000;

  uint256 public feeBps = 500; // Starts at 5% can be changed by governance

  address public treasury = msg.sender; // Treasury

  bool public paused = false;

  address[] public wantStrategies;
  // address public needStrat; // Strat used to gain more interest for the need // TODO: Actually use it (with dividend token?)


  address[] public users; // Keep track of all users that have more than 0 shares, so we can distribute directly


  event Deposit(address indexed account, uint256 amount, uint256 shares);
  event Withdraw(address indexed account, uint256 value, uint256 shares);
  event Harvest(uint256 rewardsAmount, uint256 fees); // When we receive toSwap from Strat
  event DCA(uint256 wantIn, uint256 needOut); // When we swap from toSwap to Need
  event Distribution(address indexed user, uint256 amountOfNeed); // When we send funds to X

  modifier notPaused() {
    require(!paused, "Contract is Paused");
    _;
  }

  modifier onlyStrat() {
    bool found = false;
    for(uint256 x = 0; x < wantStrategies.length; x++){
      if(wantStrategies[x] == msg.sender){
        found = true;
      }
    }
    require(found, "Only Strategies!");
    _;
  }

  modifier onlyManagement() {
    require(msg.sender == owner() || msg.sender == strategist, "Not in Management");
    _;
  }


  constructor(address _want, address _need) 
    ERC20(
    string(abi.encodePacked("Myield ", ERC20(_want).name(), " Vault with DCA to ", ERC20(_need).name())), 
    string(abi.encodePacked("MyYield", ERC20(_want).symbol(), "2" , ERC20(_need).symbol())), ERC20(_want).decimals())
  {
    want = _want;
    need = _need;

    wantDecimals = ERC20(_want).decimals();
    needDecimals = ERC20(_need).decimals();

    // NOTE: May need to think about decimals differences as they may cause problems when swapping
  }

  /** Setters */
  function setTreasury(address newTreasury) public onlyOwner {
    treasury = newTreasury;
  }

  function setFeeBps(uint256 newFeeBps) public onlyOwner {
    feeBps = newFeeBps;
  }

  function setStrategist(address newStrategist) external onlyOwner {
    strategist = newStrategist;
  }

  function addStrategy(address newStrat) external onlyOwner {
    require(IStrategy(newStrat).want() == want, "Strategy wrong want");
    IERC20(want).safeApprove(newStrat, uint256(-1));
    wantStrategies.push(newStrat);
  }

  // TODO: In future version, need sitting idle should  be invested in a strat to earn further interest
  // function setNeedStrategy(address newNeedStrart) external onlyOwner {
  //   IERC20(need).safeApprove(newNeedStrart, uint256(-1));
  //   needStrat = newNeedStrart;
  // } 

  function removeStrategy(uint256 index) public onlyOwner {
    // Put strat from index to end, then remove
    wantStrategies[index] = wantStrategies[wantStrategies.length - 1];
    IERC20(want).safeApprove(wantStrategies[index], 0);
    wantStrategies.pop();
  }


  // Management Setters
  function setPaused(bool newPaused) public onlyManagement {
    paused = newPaused;
  }

  function setFeedDecimals(uint256 newFeedDecimals) external onlyManagement {
    feedDecimals = newFeedDecimals;
  }

  // Internal Setters
  function _checkAddUser(address user) internal {
    // Check if user balance if above 0
    if(balanceOf(user) > 0 ){
      bool found = false;
      // Check if user exists
      for(uint256 x = 0; x < users.length; x++){
        if(users[x] == user){
          found = true;
          break;
        }
      }

      // If Not, Add them
      if(!found){
        users.push(user);
      }
    }
  }
  function _checkRemoveUser(address user) internal {
    // Check if user exists
    for(uint256 x = 0; x < users.length; x++){
      if(users[x] == user){
        // If found and balance is 0, remove
        if(balanceOf(user) == 0) {
          _removeUserAt(uint256(x));
        }
        break;
      }
    }


  }
  function _removeUserAt(uint256 index) internal {
    users[index] = users[users.length - 1];
    users.pop();
  }


  // The total value for the vault is the value we have + the value we invested in strats
  function getTotalValue() public view returns (uint256) {
    return balanceOfWant() + balanceInStrats(); //TODO: this needs to account for earned need to avoid deposit withdrawal attacks
  }

  function balanceOfWant() public view returns (uint256) {
    return IERC20(want).balanceOf(address(this));
  }

  function balanceOfNeed() public view returns (uint256) {
    return IERC20(need).balanceOf(address(this));
  }

  function valueOfNeed() public view returns (uint256) {
    // Calculate value of need as a function of value of want.
    // earned index has to be the thing to use.

  }


  function balanceInStrats() public view returns (uint256) {
    uint256 acc = 0;
    for(uint256 x = 0; x < wantStrategies.length; x ++) {
      acc += IStrategy(wantStrategies[x]).getTotalValue();
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
    _checkAddUser(msg.sender);

    emit Deposit(msg.sender, amount, shares);
    return shares;
  }

  /** Withdrawals */
  function fromSharesToWithdrawal(uint256 shares) public view returns (uint256) {
    return PRECISION.mul(shares).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
  }

  // Return value based as percentage of total value
  function withdraw(uint256 shares) public nonReentrant notPaused returns (uint256) {
    // TODO: you also need to get the need and the toSwap
    uint256 value = fromSharesToWithdrawal(shares);
    _burn(msg.sender, shares);

    // We need to withdraw from Strats
    if(balanceOfWant() < value) {
      // Iterate over strats
      for(uint256 x = 0; x < wantStrategies.length; x ++) {
        uint256 loss = IStrategy(wantStrategies[x]).withdraw(value);

        if(balanceOfWant() >= value) break; // Once we withdraw enough, let's stop
      }
    }

    uint256 max = balanceOfWant();

    if(value > max){
      value = max;
    }
    IERC20(want).safeTransfer(msg.sender, value);
    
    _checkRemoveUser(msg.sender);

    emit Withdraw(msg.sender, value, shares); 
    return value;
  }

  function reportHarvest(uint256 amount) external override onlyStrat {
    // Get fees and send them to treasury
    address callingStrat = msg.sender;
    uint256 fees = amount.mul(feeBps).div(MAX_BPS);

    // Take all earnings from Strat
    IERC20(want).safeTransferFrom(callingStrat, address(this), amount);

    // Send fees to treasury
    IERC20(want).safeTransfer(treasury, fees);

    toSwap = toSwap.add(amount.sub(fees)); // Set the amount we need to swap when strategist is ready

    emit Harvest(amount, fees);
  }
  // NOTE: Alternatively you could issue shares for the trasury absed on the fees value
  // Will probably do that in next iteration


  // Test function to quickly test out swapping into need
  function makeSwapDonation(uint256 amount) external nonReentrant notPaused onlyOwner {
    IERC20(need).safeTransferFrom(msg.sender, address(this), amount);
    toSwap = toSwap.add(amount);
  }


  // Used to swap from harvested to need
  function swapToNeed(uint256 cachedRewardToWantRatio) external nonReentrant notPaused onlyManagement {
    uint256 amontIn = toSwap;
    uint256 amountMin = getMinOutputAmount(amontIn, cachedRewardToWantRatio);

    address[] memory path = new address[](2);
    path[0] = address(want);
    path[1] = address(need);


    uint256 initialNeed = balanceOfNeed();

    IERC20(want).safeApprove(swapRouter, amontIn);
    IUniswapV2Router02(swapRouter).swapExactTokensForTokens(amontIn, amountMin, path, address(this), block.timestamp);

    uint256 finalNeed = balanceOfNeed();
    uint256 amountOut = finalNeed.sub(initialNeed);

    toSwap = 0;

    emit DCA(amontIn, amountOut);
  }

  // NOTE: May want to reduce to onlyOwner, also rounding means low shares will result in 0
  function distributeNeed() external nonReentrant onlyManagement {
    // Loop over each user
    // See what they earned
    // Send it to them
    uint256 toDistribute = IERC20(need).balanceOf(address(this));

    for(uint256 x = 0; x < users.length; x++){
      uint256 userShares = balanceOf(users[x]);
      uint256 userCut = toDistribute.mul(userShares).div(totalSupply());
      IERC20(need).safeTransfer(users[x], userCut);
      emit Distribution(users[x], userCut);
    }
  }


  // minOutputAmount from want earned to need
  function getMinOutputAmount(uint256 amount, uint256 ratio) public view returns (uint256) {
    // Amount is in 18 decimals, I need to convert it to 6 decimals
    uint256 amountMin = amount.mul(10 ** feedDecimals).div(ratio).mul(99).div(100); // 99% of converted from cached ratio

    // Based on decimals difference we either need to multiply or divide the result
    if(needDecimals < wantDecimals) {
      amountMin = amountMin.div(10 ** (wantDecimals.sub(needDecimals)));
    }

    if(needDecimals > wantDecimals) {
      amountMin = amountMin.mul(10 ** (needDecimals.sub(wantDecimals)));
    }

    return amountMin;
  }

  /** UNSAFE METHODS */
  // Used mostly as safety mechanism in case some other operations goes wrong
  function rug(address asset, address destination) public onlyOwner nonReentrant returns (uint256) {
    uint256 amount = IERC20(asset).balanceOf(address(this));
    IERC20(asset).safeTransfer(destination, amount);

    return amount;
  }
}
