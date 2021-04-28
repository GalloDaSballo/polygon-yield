// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;

/**
 * @title PriceOracle contract
 * @author Aave
 **/
interface IPriceOracle {
  function getAssetPrice(address _asset) external view returns(uint256);
}