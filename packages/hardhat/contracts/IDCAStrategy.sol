// // SPDX-License-Identifier: MIT

// pragma solidity 0.7.5;

// import {IStrategy} from "./IStrategy.sol";

// interface IDCAStrategy is IStrategy {
//   function need() external view returns(address);

//   function balanceOfNeed() external view returns (uint256);

//   // Harvest in a DCA Strategy will repay debt and then cash in earnings
//   // It will also use the earnings to repay any interest to ensure the principal is constant
// }