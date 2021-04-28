import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_ORACLE } from "./task-names";

task(TASK_ORACLE, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    
    const rate = await deployed.getRate()
    console.log("rate", rate.toString())
    console.log("rate", hre.ethers.utils.formatEther(rate))
    
    const canBorrow = await deployed.canBorrow()
    console.log("canBorrow", canBorrow.toString())
    console.log("canBorrow", hre.ethers.utils.formatEther(canBorrow))
});
