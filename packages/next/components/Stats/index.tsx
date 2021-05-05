import { BigNumber, Contract, ethers, utils } from "ethers";
import { useEffect, useMemo, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import * as aave from "@aave/protocol-js";

import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  WMATIC_ADDR,
} from "../../utils/constants";
import useReserve from "../../hooks/useReserve";
import { formatPercent, formatStringAmount } from "../../utils/format";

const ORACLE_ABI = [
  "function getAssetPrice(address _asset) public view returns(uint256)",
];

const EMISSIONS_PER_SECOND = "706597222222222222"; // From subgraph

const maticProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4"
);

const priceOracle = new Contract(
  "0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d",
  ORACLE_ABI,
  maticProvider
);

const usePriceOracle = (): string => {
  const [rate, setRate] = useState("1");

  useEffect(() => {
    const fetchPrice = async () => {
      const maticPricePromise = await priceOracle.getAssetPrice(
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
      );
      setRate(maticPricePromise.toString());
    };
    fetchPrice();
  }, []);
  return rate;
};

const vault = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, maticProvider);

const useRewards = (): BigNumber => {
  const [rewards, setRewards] = useState(BigNumber.from("0"));

  const fetchRewards = async () => {
    const rewardsData = await vault.getRewardsBalance();
    setRewards(rewardsData);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRewards();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return rewards;
};

// Get percentage of pool
// Multiply by emissions to get yearly amount

const getAPR = async (): Promise<any> => {
  const lendingPool = new Contract(
    "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    LendingPoolV2Artifact.abi,
    maticProvider
  );

  const resultPromise = lendingPool.getUserAccountData(CONTRACT_ADDRESS);

  const reserveDataPromise = lendingPool.getReserveData(WMATIC_ADDR);

  const [result, reserveData] = await Promise.all([
    await resultPromise,
    await reserveDataPromise,
  ]);
  const depositRate = reserveData.currentLiquidityRate;

  const borrowRate = reserveData.currentVariableBorrowRate;

  const { totalCollateralETH } = result;

  const { totalDebtETH } = result;

  const { availableBorrowsETH } = result;
  const { healthFactor } = result;

  return {
    totalCollateralETH,
    availableBorrowsETH,
    healthFactor,
    totalDebtETH,
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
    fetchStats();
  }, []);

  return stats;
};

const AddressPage: React.FC = () => {
  const stats = useApr();
  const rate = usePriceOracle();
  const rewards = useRewards();
  const [advanced, setAdvanced] = useState(false); // Extra data

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

  console.log("aaveRes", aaveRes);

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
        <h2>
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="nofollow noreferrer"
          >
            {CONTRACT_ADDRESS}
          </a>
        </h2>
        <p>Loading</p>
      </div>
    );
  }

  return (
    <div>
      <h2>
        <a
          href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="nofollow noreferrer"
        >
          {CONTRACT_ADDRESS}
        </a>
      </h2>
      <h2 onClick={() => setAdvanced(!advanced)}>STATS</h2>
      <span>All stats are expressed in MATIC unless otherwise noted</span>
      <pre>
        TVL:{" "}
        {formatStringAmount(
          utils.formatEther(
            stats.totalCollateralETH
              .mul("1000000000000000000")
              .div(rate)
              .sub(stats.totalDebtETH.mul("1000000000000000000").div(rate))
              .add(rewards)
          )
        )}
      </pre>
      <pre>
        Total Deposited:{" "}
        {formatStringAmount(
          utils.formatEther(
            stats.totalCollateralETH.mul("1000000000000000000").div(rate)
          )
        )}
      </pre>
      <pre>
        Total Borrowed:{" "}
        {formatStringAmount(
          utils.formatEther(
            stats.totalDebtETH.mul("1000000000000000000").div(rate)
          )
        )}
        <pre>Unclaimed Rewards {utils.formatEther(rewards)}</pre>
      </pre>

      {advanced && (
        <div>
          <pre>Deposit Rate: {depositApr}%</pre>
          <pre>Borrow Rate: {borrowApr}%</pre>

          <pre>Deposit Rewards APR: {depositRewardsApr}</pre>
          <pre>Borrow Rewards APR: {borrowRewardsApr}</pre>
        </div>
      )}

      <pre>
        Pool APR: {poolApr === "Loading" ? "Loading" : formatPercent(poolApr)}
      </pre>
      {advanced && (
        <div>
          <h2>RISK</h2>
          <pre>healthFactor: {utils.formatEther(stats.healthFactor)}</pre>
          <pre>
            Contract Can Borrow Another:{" "}
            {utils.formatEther(
              stats.availableBorrowsETH
                .mul("1000000000000000000")
                .div(parseFloat(rate))
            )}
          </pre>
          {advanced && <pre>ltv: {aaveRes?.[0]?.baseLTVasCollateral}</pre>}
        </div>
      )}
    </div>
  );
};

export default AddressPage;
