import { Contract, ethers } from "ethers";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import LendingPoolV2Artifact from "@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/constants";

const ORACLE_ABI = [
  "function getAssetPrice(address _asset) public view returns(uint256)",
];

const getAPR = async (): Promise<any> => {
  const maticProvider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4"
  );
  const vault = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, maticProvider);

  const rewardsData = await vault.getRewardsBalance();
  const rewards = ethers.utils.formatEther(rewardsData);

  const lendingPool = new Contract(
    "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    LendingPoolV2Artifact.abi,
    maticProvider
  );

  const result = await lendingPool.getUserAccountData(CONTRACT_ADDRESS);
  console.log("result", result);

  const priceOracle = new Contract(
    "0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d",
    ORACLE_ABI,
    maticProvider
  );

  const maticPrice = await priceOracle.getAssetPrice(
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
  );
  const rate = ethers.utils.formatEther(maticPrice);

  const totalCollateralETH = ethers.utils.formatEther(
    result.totalCollateralETH.toString()
  );
  const totalDebtETH = ethers.utils.formatEther(result.totalDebtETH.toString());

  const availableBorrowsETH = ethers.utils.formatEther(
    result.availableBorrowsETH.toString()
  );
  const healthFactor = ethers.utils.formatEther(result.healthFactor.toString());

  const currentLiquidationThreshold = result.currentLiquidationThreshold.toString();
  const ltv = result.ltv.toString();

  const max = ethers.utils.formatEther(
    result.totalCollateralETH.sub(
      result.totalDebtETH.mul(10000).div(result.currentLiquidationThreshold)
    )
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
  };
};

const useApr = () => {
  const [stats, setStats] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      const res = await getAPR();
      setStats(res);
    } catch (err) {}
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
    return <p>Loading</p>;
  }

  return (
    <div>
      <h2>{CONTRACT_ADDRESS}</h2>
      <pre>Unclaimed Rewards {stats.rewards}</pre>
      <pre>totalCollateralETH: {stats.totalCollateralETH}</pre>
      <pre>availableBorrowsETH: {stats.availableBorrowsETH}</pre>
      <pre>healthFactor: {stats.healthFactor}</pre>

      <pre>totalDebtETH: {stats.totalDebtETH}</pre>

      <pre>
        currentLiquidationThreshold: {stats.currentLiquidationThreshold}
      </pre>
      <pre>ltv: {stats.ltv}</pre>
      <pre>Rate: {stats.rate}</pre>

      <pre>
        You can borrow another:{" "}
        {parseFloat(stats.availableBorrowsETH) / parseFloat(stats.rate)}
      </pre>
      <pre>
        You Deposited:{" "}
        {parseFloat(stats.totalCollateralETH) / parseFloat(stats.rate)}
      </pre>
      <pre>
        You Borrowed: {parseFloat(stats.totalDebtETH) / parseFloat(stats.rate)}
      </pre>
      <pre>
        Max you can withdraw (from Health){" "}
        {parseFloat(stats.max) / parseFloat(stats.rate)}{" "}
      </pre>
      <pre>As 95% {stats.ninetyFive.toString()} </pre>
    </div>
  );
};

export default AddressPage;
