import { BigNumber, Contract, ethers, utils } from "ethers";
import { useEffect, useMemo, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import * as aave from "@aave/protocol-js";
import styles from "./Stats.module.scss";

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

const EMISSIONS_PER_SECOND = "37187500000000000"; // From subgraph

const maticProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4",
  137
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

const useStats = () => {
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

const wMATICIcon =
  "https://assets.coingecko.com/coins/images/4713/large/Matic.png?1553498071";

const StatsHeader: React.FC = () => (
  <div className={styles.headerEntry}>
    <a
      href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
      target="_blank"
      rel="nofollow noreferrer"
    >
      <img src={wMATICIcon} alt="wMATIC" />
      <h3>wMATIC</h3>
    </a>
  </div>
);

const AddressPage: React.FC<{ arrowDown: boolean }> = ({ arrowDown }) => {
  const stats = useStats();
  const rate = usePriceOracle();
  const rewards = useRewards();

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
      <div className={styles.container}>
        <StatsHeader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <StatsHeader />
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
        <h3>Pool APY</h3>
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

export default AddressPage;
