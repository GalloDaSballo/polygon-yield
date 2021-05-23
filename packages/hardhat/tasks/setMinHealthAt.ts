import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { AAVEUSDCRewards } from "../typechain";

import { TASK_SET_MIN_HEALTH_AT } from "./task-names";

task(TASK_SET_MIN_HEALTH_AT, "Prints the list of accounts") 
    .addParam("strat", "Address of the Strat")
    .addParam("minhealth", "Min Health")
    .setAction(async (taskArgs, hre) => {
    const strat = (await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat)) as AAVEUSDCRewards
    console.log("deployed", strat.address)
    const ABSOLUTE_MIN = "1000000000000000000";

    if(BigNumber.from(taskArgs.minhealth).lt(ABSOLUTE_MIN)){
        throw new Error("Please check for an acceptable health value")
    }

    const newSet = await (await strat["setMinHealth(uint256)"](taskArgs.minhealth, {gasLimit: 5000000})).wait()
    console.log("newsetTx", newSet.transactionHash)

    const newMin = await strat.minHealth()
    console.log("newMin", newMin.toString())
});
