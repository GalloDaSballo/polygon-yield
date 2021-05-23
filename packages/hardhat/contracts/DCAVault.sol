// // SPDX-License-Identifier: MIT

// pragma solidity 0.7.5;

// import "hardhat/console.sol";
// import { ERC20 } from "./aave/lib/ERC20.sol";
// import { SafeERC20 } from "./aave/lib/SafeERC20.sol";
// import { SafeMath } from "./aave/lib/SafeMath.sol";
// import { IERC20 } from "./aave/interfaces/IERC20.sol";
// import { Ownable } from "./aave/lib/Ownable.sol";
// import { ReentrancyGuard } from "./aave/lib/ReentrancyGuard.sol";
// import { IUniswapV2Router02 } from "./uniswap/IUniswapV2Router02.sol";

// import { IDCAStrategy } from "./IDCAStrategy.sol";
// contract MyieldVault is ERC20, Ownable, ReentrancyGuard {

//   using SafeMath for uint256;
//   using SafeERC20 for IERC20;

//   address public immutable want; // You can only ever deposit want

//   address public immutable need; // You can swap to need but you can't deposit it back

//   uint256 public constant PRECISION = 1 * 10 ** 18; // PRECISION.mul(w/e).div(PRECISION) to avoid rounding

//   uint256 public constant MAX_BPS = 10000;

//   uint256 public feeBps = 500; // Starts at 5% can be changed by governance

//   uint256 public toSwap = 0; // The Amount we'll swap in the next swap call, used to avoid swapping deposits and stuff

//   address public strategist = msg.sender; // Used to Rebalance Pools

//   address public treasury = msg.sender; // Treasury

//   address public constant sushiswap = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;

//   bool public paused = false;

//   address[] public strategies;

//   event Deposit(address indexed account, uint256 amount, uint256 shares);
//   event Withdraw(address indexed account, uint256 value, uint256 shares);
//   event Harvest(uint256 rewardsAmount, uint256 fees);


//   modifier onlyManagement() {
//     require(msg.sender == owner() || msg.sender == strategist, "Not in Management");
//     _;
//   }

//   modifier notPaused() {
//     require(!paused, "Contract is Paused");
//     _;
//   }

//   modifier onlyStrat() {
//     bool found = false;
//     for(uint256 x = 0; x < strategies.length; x++){
//       if(strategies[x] == msg.sender){
//         found = true;
//       }
//     }

//     require(found, "Only Strategies!");
//     _;
//   }


//   constructor(address _want, address _need) 
//     ERC20(
//     string(abi.encodePacked("Myield ", ERC20(want).name(), " Vault with DCA to ", ERC20(need).name())), 
//     string(abi.encodePacked("MyYield", ERC20(want).symbol(), "2" , ERC20(need).symbol())), 18)
//   {
//     want = _want;
//     need = _need;
//   }

//   /** Setters */
//   // OnlyOwner 
//   function setStrategist(address newStrategist) public onlyOwner {
//     strategist = newStrategist;
//   }

//   function setTreasury(address newTreasury) public onlyOwner {
//     treasury = newTreasury;
//   }

//   function setFeeBps(uint256 newFeeBps) public onlyOwner {
//     feeBps = newFeeBps;
//   }

//   function addStrategy(address newStrat) public onlyOwner {
//     require(IDCAStrategy(newStrat).want() == want, "Strategy wrong want");
//     require(IDCAStrategy(newStrat).need() == need, "Strategy wrong need");

//     strategies.push(newStrat);
//   }

//   // NOTE: Index starts from zero
//   function removeStrategy(uint256 index) public onlyOwner {
//     // Put strat from index to end, then remove
//     strategies[index] = strategies[strategies.length - 1];
//     strategies.pop();
//   }

//   // Management
//   function setPaused(bool newPaused) public onlyManagement {
//     paused = newPaused;
//   }


//   // The total value for the vault is the value we have + the value we invested in strats
//   function getTotalValue() public view returns (uint256) {
//     return balanceOfWant() + balanceOfNeed() + balanceInStrats();
//   }

//   function balanceOfWant() public view returns (uint256) {
//     return IERC20(want).balanceOf(address(this));
//   }

//   function balanceOfNeed() public view returns (uint256) {
//     return IERC20(need).balanceOf(address(this));
//   }

//   function balanceInStrats() public view returns (uint256) {
//     uint256 acc = 0;
//     for(uint256 x = 0; x < strategies.length; x ++) {
//       acc += IDCAStrategy(strategies[x]).getTotalValue();
//     }
//     return acc;
//   }


//   /** Deposit */
//   function fromDepositToShares(uint256 amount) public view returns (uint256){
//     return PRECISION.mul(amount).mul(totalSupply()).div(getTotalValue()).div(PRECISION);
//   }

//   // Deposit want into the vault
//   function deposit(uint256 amount) public nonReentrant notPaused returns (uint256) {
//     uint256 shares = 0;

//     if(totalSupply() == 0){
//       shares = amount;
//     } else {
//       shares = fromDepositToShares(amount);
//     }
//     _mint(msg.sender, shares);

//     emit Deposit(msg.sender, amount, shares);
//     return shares;
//   }

//   /** Withdrawals */
//   function fromSharesToWithdrawal(uint256 shares) public view returns (uint256){
//     return PRECISION.mul(shares).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
//   }

//   // Return value based as percentage of total value
//   function withdraw(uint256 shares) public nonReentrant notPaused returns (uint256) {
//     uint256 value = fromSharesToWithdrawal(shares);
//     _burn(msg.sender, shares);

//     // We need to withdraw from Strats
//     if(balanceOfWant() < value) {
//       // Iterate over strats
//       for(uint256 x = 0; x < strategies.length; x ++) {
//         uint256 loss = IDCAStrategy(strategies[x]).withdraw(value);

//         if(balanceOfWant() >= value) break; // Once we withdraw enough, let's stop
//       }
//     }

//     uint256 max = balanceOfWant();

//     if(value > max){
//       value = max;
//     }
//     IERC20(want).safeTransfer(msg.sender, value);

//     emit Withdraw(msg.sender, value, shares); 
//     return value;
//   }

//   // Called by strat to deposit want that has been earned and has to be DCAd into need
//   function receiveToSwap(uint256 amountIn) external nonReentrant onlyStrat {
//     // do a safeTransferFrom From the Strat to here
//     IERC20(want).safeTransferFrom(msg.sender, address(this), amountIn);
//     toSwap.add(amountIn);
//   }

//   // Used to swap from harvested to need
//   function swap(uint256 rate) public nonReentrant notPaused onlyManagement returns (uint256, uint256) {
//     uint256 amontIn = toSwap;
//     uint256 amountMin = amontIn.mul(rate).mul(99).div(100).div(10 ** 8); //1% slippage // 8 decimals

//     address[] memory path = new address[](2);
//     path[0] = address(want);
//     path[1] = address(need);
    
//     IUniswapV2Router02(sushiswap).swapExactTokensForTokens(amontIn, amountMin, path, address(this), block.timestamp);

//     toSwap = 0;
//   }

//   // May or may not keep this
//   function reinvestToSwap() public nonReentrant notPaused onlyManagement returns (uint256, uint256) {
//     // NOTE: WHICHS STRAT????
//     // If for whatever reason we don't want to DCA anymore, let's reinvest
//     // strategies.deposit()
//   }


//   /** UNSAFE METHODS */
//   // Used mostly as safety mechanism in case some other operations goes wrong
//   function rug(address asset, address destination) public onlyOwner nonReentrant returns (uint256){
//     uint256 amount = IERC20(asset).balanceOf(address(this));
//     IERC20(asset).safeTransfer(destination, amount);

//     return amount;
//   }
// }
