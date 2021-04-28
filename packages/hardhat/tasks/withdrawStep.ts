import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_WITHDRAW_STEP } from "./task-names";

task(TASK_WITHDRAW_STEP, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)


    const deployed = (await hre.ethers.getContract("Myield")) as Myield

    const canRepay = await deployed["canRepay()"]({ gasLimit: 6000000 })
    console.log("canTake", canRepay.toString())
    console.log("canTake", hre.ethers.utils.formatEther(canRepay))


    console.log("Withdrawing from Aave")
    const res = await (await deployed.withdrawStepFromAAVE(canRepay, { gasLimit: 6000000 })).wait()

    console.log("done: ", res.transactionHash)
});
