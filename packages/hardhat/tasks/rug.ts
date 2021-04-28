import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_RUG } from "./task-names";

task(TASK_RUG, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    // 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 is USDC
    // 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 is WMATIC
    const wMatic = (await hre.ethers.getContractAt("Myield", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174")) as ERC20
    const balance = await wMatic.balanceOf(deployed.address)
    console.log("balance", balance)

    const toRug = balance


    
    if(toRug.gt(0)){
        await (await deployed.rug("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", deployer)).wait()
    } else {
        console.log("No value")
    }
});
