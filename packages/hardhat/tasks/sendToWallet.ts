import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_SEND_TO_WALLET } from "./task-names";

task(TASK_SEND_TO_WALLET, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const wMatic = (await hre.ethers.getContractAt("Myield", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270")) as ERC20
    const balance = await wMatic.balanceOf(deployer)
    console.log("balance", balance.toString())

    await (await wMatic.transfer("0x2E4CcF4F1F58eDce8Ab75Fbb23e6d5f76Ee080f9", balance)).wait()

});
