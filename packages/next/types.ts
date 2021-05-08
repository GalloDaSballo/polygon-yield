export type ReserveData = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFreezed: boolean;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableBorrowRate: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  avg30DaysVariableBorrowRate?: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  avg30DaysLiquidityRate?: string;
  totalBorrows: string;
  totalBorrowsStable: string;
  totalBorrowsVariable: string;
  totalLiquidity: string;
  utilizationRate: string;
  lastUpdateTimestamp: number;
  aToken: {
    id: string;
  };
  price: {
    priceInEth: string;
  };
};

export type ComputedReserveData = {
  utilizationRate: string;
  totalStableDebt: string;
  totalVariableDebt: string;
  totalDebt: string;
  totalLiquidity: string;
  aIncentivesAPY: string;
  vIncentivesAPY: string;
  sIncentivesAPY: string;
} & ReserveData;

export type ProtocolData = {
  lifetimeUsers: string;
  lifetimeTreasury: string;
  lifetimeDeposited: string;
  lifetimeHarvested: string;
};

export type AccountData = {
  id: string;
  deposited: string;
  shares: string;
  earned: string;
};
