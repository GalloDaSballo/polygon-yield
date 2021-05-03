import { BigNumber, Contract, ethers, utils } from "ethers";
import { useEffect, useMemo, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import ProtocolDataProvider from "@aave/protocol-v2/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import * as aave from "@aave/protocol-js";

import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  WMATIC_ADDR,
} from "../../utils/constants";
import useReserve from "../../hooks/useReserve";

const ORACLE_ABI = [
  "function getAssetPrice(address _asset) public view returns(uint256)",
];

const EMISSIONS_PER_SECOND = "706597222222222222"; // From subgraph

// Get percentage of pool
// Multiply by emissions to get yearly amount

const getAPR = async (): Promise<any> => {
  const maticProvider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4"
  );
  const vault = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, maticProvider);

  const rewardsData = await vault.getRewardsBalance();
  const rewards = rewardsData;

  const lendingPool = new Contract(
    "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    LendingPoolV2Artifact.abi,
    maticProvider
  );

  const resultPromise = lendingPool.getUserAccountData(CONTRACT_ADDRESS);

  const reserveDataPromise = lendingPool.getReserveData(WMATIC_ADDR);

  const priceOracle = new Contract(
    "0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d",
    ORACLE_ABI,
    maticProvider
  );

  const maticPricePromise = priceOracle.getAssetPrice(
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
  );

  const dataProvider = new Contract(
    "0x7551b5D2763519d4e37e8B81929D336De671d46d",
    ProtocolDataProvider.abi,
    maticProvider
  );

  const [result, reserveData, maticPrice] = await Promise.all([
    await resultPromise,
    await reserveDataPromise,
    await maticPricePromise,
  ]);
  const depositRate = reserveData.currentLiquidityRate;

  const borrowRate = reserveData.currentVariableBorrowRate;

  const rate = maticPrice;

  const { totalCollateralETH } = result;

  const { totalDebtETH } = result;

  const { availableBorrowsETH } = result;
  const { healthFactor } = result;

  const { currentLiquidationThreshold } = result;
  console.log("currentLiquidationThreshold", currentLiquidationThreshold);
  const { ltv } = result;

  const max = currentLiquidationThreshold.gt("0")
    ? result.totalCollateralETH.sub(
        result.totalDebtETH.mul(10000).div(result.currentLiquidationThreshold)
      )
    : "0";

  const ninetyFive = currentLiquidationThreshold.gt("0")
    ? result.totalCollateralETH
        .sub(
          result.totalDebtETH.mul(10000).div(result.currentLiquidationThreshold)
        )
        .mul(95)
        .div(100)
    : "0";

  return {
    currentLiquidationThreshold,
    totalCollateralETH,
    availableBorrowsETH,
    healthFactor,
    ltv,
    totalDebtETH,
    rate,
    max,
    ninetyFive,
    rewards,
    depositRate,
    borrowRate,
  };
};

const useApr = () => {
  const [stats, setStats] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      const res = await getAPR();
      setStats(res);
    } catch (err) {
      console.log("something went wrogn", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

const AddressPage: React.FC = () => {
  const stats = useApr();
  const reserve = useReserve(
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700xd05e3e715d945b59290df0ae8ef85c1bdb684744"
  );
  console.log("reserve", reserve);

  // Apr for depoist and borrow is in aaveRes
  const aaveRes: any = reserve
    ? aave.v2.formatReserves([reserve as any], new Date().getTime() / 1000)
    : null;

  const borrowRewardsApr = reserve
    ? aave.v2.calculateIncentivesAPY(
        EMISSIONS_PER_SECOND,
        aaveRes[0].price.priceInEth,
        aaveRes[0].totalDebt,
        aaveRes[0].price.priceInEth
      )
    : "Loading";
  console.log("debtRewardsApy", borrowRewardsApr);

  const depositRewardsApr = reserve
    ? aave.v2.calculateIncentivesAPY(
        EMISSIONS_PER_SECOND,
        aaveRes[0].price.priceInEth,
        aaveRes[0].totalLiquidity,
        aaveRes[0].price.priceInEth
      )
    : "Loading";

  const depositApr = stats ? utils.formatUnits(stats.depositRate, 27) : "0";
  const borrowApr = stats ? utils.formatUnits(stats.borrowRate, 27) : "0";

  const poolApr = useMemo(() => {
    if (!stats || !reserve) {
      return "Loading";
    }

    const totalDepApr = parseFloat(depositApr) + parseFloat(depositRewardsApr);
    const totalDepYield =
      totalDepApr * parseFloat(stats.totalCollateralETH.toString());
    const totalBorrowApr = parseFloat(borrowRewardsApr) - parseFloat(borrowApr);
    const totalBorrowYield =
      totalBorrowApr * parseFloat(stats.totalDebtETH.toString());

    const initialCapital =
      parseFloat(stats.totalCollateralETH.toString()) -
      parseFloat(stats.totalDebtETH.toString());

    const percent = (totalDepYield + totalBorrowYield) / initialCapital;

    return percent;
  }, [
    stats,
    reserve,
    borrowApr,
    borrowRewardsApr,
    depositApr,
    depositRewardsApr,
  ]);

  if (!stats) {
    return (
      <div>
        <h2>{CONTRACT_ADDRESS}</h2>
        <p>Loading</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{CONTRACT_ADDRESS}</h2>
      <h2>STATS</h2>
      <pre>
        TVL:{" "}
        {utils.formatEther(
          stats.totalCollateralETH
            .mul("1000000000000000000")
            .div(stats.rate)
            .sub(stats.totalDebtETH.mul("1000000000000000000").div(stats.rate))
            .add(stats.rewards)
        )}
      </pre>
      <pre>
        Total Deposited:{" "}
        {utils.formatEther(
          stats.totalCollateralETH.mul("1000000000000000000").div(stats.rate)
        )}
      </pre>
      <pre>
        Total Borrowed:{" "}
        {utils.formatEther(
          stats.totalDebtETH.mul("1000000000000000000").div(stats.rate)
        )}
      </pre>

      <h2>MATH</h2>
      <pre>Unclaimed Rewards {utils.formatEther(stats.rewards)}</pre>
      <pre>Deposit Rate: {depositApr}%</pre>
      <pre>Borrow Rate: {borrowApr}%</pre>

      <pre>Deposit Rewards APR: {depositRewardsApr}</pre>
      <pre>Borrow Rewards APR: {borrowRewardsApr}</pre>

      <pre>Pool APR: {poolApr}</pre>

      <h2>RISK</h2>
      <pre>healthFactor: {utils.formatEther(stats.healthFactor)}</pre>
      <pre>
        Contract Can Borrow Another:{" "}
        {utils.formatEther(
          stats.availableBorrowsETH
            .mul("1000000000000000000")
            .div(parseFloat(stats.rate))
        )}
      </pre>
      <pre>ltv: {stats.ltv.toString()}</pre>
    </div>
  );
};

export default AddressPage;
