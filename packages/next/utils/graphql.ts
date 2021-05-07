import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { AAVE_SUBGRAPH_URL, MYIELD_SUBGRAPH_URL } from "./constants";

export const client = new ApolloClient({
  uri: AAVE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

export const protocolClient = new ApolloClient({
  uri: MYIELD_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

/**
 * Retrieve Reserve Data
 */
export const GET_RESERVE_DATA = gql`
  query reserves($reserveAddress: String!) {
    reserves(where: { id: $reserveAddress }) {
      id
      underlyingAsset
      name
      symbol
      decimals
      isActive
      isFrozen
      usageAsCollateralEnabled
      borrowingEnabled
      stableBorrowRateEnabled
      baseLTVasCollateral
      optimalUtilisationRate
      averageStableRate
      stableRateSlope1
      stableRateSlope2
      baseVariableBorrowRate
      variableRateSlope1
      variableRateSlope2
      variableBorrowIndex
      variableBorrowRate
      totalScaledVariableDebt
      liquidityIndex
      reserveLiquidationThreshold
      aToken {
        id
      }
      vToken {
        id
      }
      sToken {
        id
      }
      availableLiquidity
      stableBorrowRate
      liquidityRate
      totalPrincipalStableDebt
      totalLiquidity
      utilizationRate
      reserveLiquidationBonus
      price {
        priceInEth
      }
      lastUpdateTimestamp
      stableDebtLastUpdateTimestamp
      reserveFactor
    }
  }
`;

export const GET_PROTOCOL_DATA = gql`
  query getProtocol($version: String!) {
    protocol(id: $version) {
      lifetimeUsers
      lifetimeTreasury
      lifetimeDeposited
      lifetimeHarvested
    }
  }
`;

export const GET_ACCOUNT_DATA = gql`
  query getAccount($address: String!) {
    account(id: $address) {
      deposited
      earned
      shares
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query getLeaderboard($orderBy: String!, $orderDirection: String!) {
    accounts(first: 50, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      deposited
      earned
      shares
    }
  }
`;
