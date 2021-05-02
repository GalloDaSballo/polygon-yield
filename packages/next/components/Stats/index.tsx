import { BigNumber, Contract, ethers, utils } from "ethers";
import { useEffect, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  WMATIC_ADDR,
} from "../../utils/constants";

const ORACLE_ABI = [
  "function getAssetPrice(address _asset) public view returns(uint256)",
];

const EMISSIONS_PER_SECOND = "706597222222222222"; // From subgraph

const SECS_PER_YEAR = "31536000";

const calculateAPR = (supply: BigNumber): BigNumber => {
  const emissionsPerSecond = utils.parseEther(EMISSIONS_PER_SECOND);
  const emissionPerYear = emissionsPerSecond.mul(SECS_PER_YEAR);

  return emissionPerYear.div(supply).mul(10 ** 6);
};

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

  const [result, reserveData, maticPrice] = await Promise.all([
    await resultPromise,
    await reserveDataPromise,
    await maticPricePromise,
  ]);

  console.log("result", result);
  console.log("reserveData", reserveData);
  const depositRate = reserveData.currentLiquidityRate;

  const borrowRate = reserveData.currentVariableBorrowRate;

  const depositApr = calculateAPR(
    reserveData.liquidityIndex.add(reserveData.variableBorrowIndex)
  );
  const borrowApr = calculateAPR(reserveData.variableBorrowIndex);

  const rate = maticPrice;

  const { totalCollateralETH } = result;

  const { totalDebtETH } = result;

  const { availableBorrowsETH } = result;
  const { healthFactor } = result;

  const { currentLiquidationThreshold } = result;
  const { ltv } = result;

  const max = result.totalCollateralETH.sub(
    result.totalDebtETH.mul(10000).div(result.currentLiquidationThreshold)
  );

  const ninetyFive = result.totalCollateralETH
    .sub(result.totalDebtETH.mul(10000).div(result.currentLiquidationThreshold))
    .mul(95)
    .div(100);

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
    depositApr,
    borrowApr,
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
      <h2>MATH</h2>
      <pre>Unclaimed Rewards {utils.formatEther(stats.rewards)}</pre>
      <pre>Deposit Rate: {utils.formatUnits(stats.depositRate, 25)}%</pre>
      <pre>Borrow Rate: {utils.formatUnits(stats.borrowRate, 25)}%</pre>

      <pre>Spot Rewards APR: {utils.formatUnits(stats.depositApr, 21)}%</pre>
      <pre>Spot Rewards APR: {utils.formatUnits(stats.borrowApr, 21)}%</pre>
      <span>
        SPOT APR because we don't calculate compounding depoists and loans
      </span>
      <h2>STATS</h2>
      <pre>
        Contract Can Borrow Another:{" "}
        {utils.formatEther(
          stats.availableBorrowsETH
            .mul("1000000000000000000")
            .div(parseFloat(stats.rate))
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

      <h2>RISK</h2>
      <pre>healthFactor: {utils.formatEther(stats.healthFactor)}</pre>

      <pre>ltv: {stats.ltv.toString()}</pre>
    </div>
  );
};

export default AddressPage;
