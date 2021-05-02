import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";


task("rugOld", "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)


    // 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 is USDC
    // 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 is WMATIC
    // 0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4 is amWMATIC
    const deployed = (await hre.ethers.getContractAt("Myield", "0x1D5Af4e5771e1ba53b47558e815d3BF352c9138A")) as Myield


    
    await (await deployed.rug("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", "0x2E4CcF4F1F58eDce8Ab75Fbb23e6d5f76Ee080f9", {gasLimit: 1000000})).wait()
});
