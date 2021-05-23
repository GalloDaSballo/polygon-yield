import { BigNumber, Contract, ethers, utils } from "ethers";
import { useEffect, useMemo, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import * as aave from "@aave/protocol-js";
import styles from "./Stats.module.scss";

import { EXPLORER_URL } from "../../utils/constants";
import useReserve from "../../hooks/useReserve";
import { formatPercent, formatStringAmount } from "../../utils/format";
import { Vault } from "../../types";
import { REWARDS_STRAT_ABI } from "../../utils/strat";

const ORACLE_ABI = [
  "function getAssetPrice(address _asset) public view returns(uint256)",
];

const EMISSIONS_PER_SECOND = "706597222222222222"; // From subgraph

// Mapping of want address to reserve id for subgraph
const WANT_TO_RESERVE = {
  // USDC
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174":
    "0x2791bca1f2de4661ed88a30c99a7a9449aa841740xd05e3e715d945b59290df0ae8ef85c1bdb684744",

  // wMATIC
  "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270":
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700xd05e3e715d945b59290df0ae8ef85c1bdb684744",
  // wBTC
  "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6":
    "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd60xd05e3e715d945b59290df0ae8ef85c1bdb684744",

  rewards:
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700xd05e3e715d945b59290df0ae8ef85c1bdb684744", // It's also wMatic
};

const maticProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4",
  137
);

const priceOracle = new Contract(
  "0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d",
  ORACLE_ABI,
  maticProvider
);

const usePriceOracle = (want: string): string => {
  const [rate, setRate] = useState("1");

  useEffect(() => {
    const fetchPrice = async () => {
      const maticPricePromise = await priceOracle.getAssetPrice(want);
      setRate(maticPricePromise.toString());
    };
    fetchPrice();
  }, []);
  return rate;
};

// TODO: This won't work with more than one strat
// Also this is using Vault instead of strat, refactor
const useRewards = (address: string): BigNumber => {
  const stratContract = new Contract(address, REWARDS_STRAT_ABI, maticProvider);

  const [rewards, setRewards] = useState(BigNumber.from("0"));

  const fetchRewards = async () => {
    const rewardsData = await stratContract.getRewardsAmount();
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

const getAPR = async (vault: Vault): Promise<any> => {
  const lendingPool = new Contract(
    "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    LendingPoolV2Artifact.abi,
    maticProvider
  );

  const resultPromise = lendingPool.getUserAccountData(vault.rewardsStrat);

  const reserveDataPromise = lendingPool.getReserveData(vault.want.address);

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

const useStats = (vault: Vault) => {
  const [stats, setStats] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      const res = await getAPR(vault);
      setStats(res);
    } catch (err) {
      console.log("something went wrogn", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

const StatsHeader: React.FC<{ vault: Vault; dca?: boolean }> = ({
  vault,
  dca = false,
}) => (
  <div className={styles.headerEntry}>
    <a
      href={`${EXPLORER_URL}/address/${vault.address}`}
      target="_blank"
      rel="nofollow noreferrer"
    >
      <img src={vault.logoURI} alt={vault.name} />
      {dca && (
        <>
          {" "}
          {"->"} <img src={vault.need.logoURI} alt={vault.need.name} />
        </>
      )}
      <h3>{vault.name}</h3>
    </a>
  </div>
);

const Stats: React.FC<{ vault: Vault; arrowDown: boolean; dca?: boolean }> = ({
  vault,
  arrowDown,
  dca = false,
}) => {
  const stats = useStats(vault);
  const rate = usePriceOracle(vault.want.address);
  const rewards = useRewards(vault.rewardsStrat);

  const wantReserve = useReserve(WANT_TO_RESERVE[vault.want.address]);
  const rewardsReserve = useReserve(WANT_TO_RESERVE.rewards);

  // Apr for depoist and borrow is in aaveRes
  const formattedWantReserves: any = wantReserve
    ? aave.v2.formatReserves([wantReserve as any], new Date().getTime() / 1000)
    : null;

  // Apr for depoist and borrow is in aaveRes
  const formattedRewardsReserves: any = rewardsReserve
    ? aave.v2.formatReserves(
        [rewardsReserve as any],
        new Date().getTime() / 1000
      )
    : null;

  const borrowRewardsApr =
    wantReserve && formattedRewardsReserves
      ? aave.v2.calculateIncentivesAPY(
          EMISSIONS_PER_SECOND,
          formattedRewardsReserves[0].price.priceInEth, // This is rewards
          formattedWantReserves[0].totalDebt,
          formattedWantReserves[0].price.priceInEth // This is want
        )
      : "Loading";

  const depositRewardsApr =
    wantReserve && formattedRewardsReserves
      ? aave.v2.calculateIncentivesAPY(
          EMISSIONS_PER_SECOND,
          formattedRewardsReserves[0].price.priceInEth, // This is rewards
          formattedWantReserves[0].totalLiquidity,
          formattedWantReserves[0].price.priceInEth // This is want
        )
      : "Loading";

  const depositApr = stats ? utils.formatUnits(stats.depositRate, 27) : "0";
  const borrowApr = stats ? utils.formatUnits(stats.borrowRate, 27) : "0";

  const poolApr = useMemo(() => {
    if (!stats || !wantReserve) {
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
    wantReserve,
    borrowApr,
    borrowRewardsApr,
    depositApr,
    depositRewardsApr,
  ]);

  if (!stats) {
    return (
      <div className={styles.container}>
        <StatsHeader dca={dca} vault={vault} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <StatsHeader dca={dca} vault={vault} />
      <div>
        <p>
          {formatStringAmount(
            utils.formatEther(
              stats.totalCollateralETH
                .mul("1000000000000000000")
                .div(rate)
                .sub(stats.totalDebtETH.mul("1000000000000000000").div(rate))
            )
          )}
        </p>
        <h3>TVL</h3>
      </div>
      <div>
        <p>
          {formatStringAmount(
            utils.formatEther(
              stats.totalCollateralETH.mul("1000000000000000000").div(rate)
            )
          )}
        </p>
        <h3>Total Deposited</h3>
      </div>
      <div>
        <p>
          {formatStringAmount(
            utils.formatEther(
              stats.totalDebtETH.mul("1000000000000000000").div(rate)
            )
          )}
        </p>
        <h3>Total Borrowed</h3>
      </div>
      <div>
        <p>{utils.formatEther(rewards)} (wMATIC)</p>
        <h3>Unclaimed Rewards</h3>
      </div>
      <div>
        <p>{poolApr === "Loading" ? "Loading" : formatPercent(poolApr)}</p>
        <h3>Pool APR</h3>
      </div>
      <div className={styles.arrowContainer}>
        <div className={styles.arrowButton}>
          <img
            alt="Click to toggle"
            className={arrowDown ? styles.arrowDown : undefined}
            src="/images/arrow-up.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
