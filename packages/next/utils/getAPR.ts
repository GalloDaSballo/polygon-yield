import { Contract, ethers } from "ethers";

const LendingPoolV2Artifact = require("@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json");

const getAPR = async (assetAddress: string): Promise<void> => {
  const lendingPool = new Contract(
    "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    LendingPoolV2Artifact.abi,
    new ethers.providers.JsonRpcProvider(
      "https://rpc-mainnet.maticvigil.com/v1/c3465edfbaa8d0612c382aad7cb5f876418eb4f4"
    )
  );

  const result = await lendingPool.getUserAccountData(
    "0x2E4CcF4F1F58eDce8Ab75Fbb23e6d5f76Ee080f9"
  );
  console.log("result", result);

  console.log(
    "currentLiquidationThreshold",
    ethers.utils.formatEther(result.currentLiquidationThreshold.toString())
  );
  console.log(
    "totalCollateralETH",
    ethers.utils.formatEther(result.totalCollateralETH.toString())
  );
  console.log(
    "availableBorrowsETH",
    ethers.utils.formatEther(result.availableBorrowsETH.toString())
  );
  console.log(
    "healthFactor",
    ethers.utils.formatEther(result.healthFactor.toString())
  );
  console.log(
    "totalDebtETH",
    ethers.utils.formatEther(result.totalDebtETH.toString())
  );
  console.log(
    "currentLiquidationThreshold",
    result.currentLiquidationThreshold.toString()
  );
  console.log("ltv", result.ltv.toString());
};

export default getAPR;
