import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_TOTAL_VALUE } from "./task-names";

task(TASK_TOTAL_VALUE, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    const value = await deployed["getTotalValue()"]()
    console.log("value", value)
    console.log("value", hre.ethers.utils.formatEther(value))

});
