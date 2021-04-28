import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_CAN_TAKE } from "./task-names";

task(TASK_CAN_TAKE, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    
    const deposited = await deployed.deposited()
    const owed = await deployed.owed()
    console.log("deposited", deposited.toString())
    console.log("owed", owed.toString())


    const canTakeMath = await deposited.sub(owed).div(2)
    console.log("canTake", canTakeMath.toString())
    console.log("canTake", hre.ethers.utils.formatEther(canTakeMath))

    const canTake = await deployed.canTake()
    console.log("canTake", canTake.toString())
    console.log("canTake", hre.ethers.utils.formatEther(canTake))
});
