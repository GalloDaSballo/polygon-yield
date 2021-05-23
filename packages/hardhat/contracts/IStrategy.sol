// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

interface IStrategy {
  function want() external returns (address);
  
  // Deposit new Principal
  function deposit(uint256 amount) external returns (uint256);
  // Withdraw X Principal
  function withdraw(uint256 amount) external returns (uint256);

  //  Earns rewards, repays debt, reinvest rewards
  function harvest(uint256 cachedRewardToWantRatio) external;

  function balanceOfWant() external view returns (uint256);
  function getTotalValue() external view returns (uint256);

  // These are here because our stats have to be managed
  function invest() external;
  function divest() external;

  // These are here because our stats have to be managed
  function shouldInvest() external returns (bool);
  function shouldDivest() external returns (bool);
}