// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
interface IVault {
  function reportHarvest(uint256 amount) external;
}