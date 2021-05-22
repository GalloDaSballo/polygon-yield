import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { AAVEUSDCRewards } from "../typechain";

import { TASK_SET_REBALANCE_AMOUNT_AT } from "./task-names";

task(TASK_SET_REBALANCE_AMOUNT_AT, "Prints the list of accounts") 
    .addParam("strat", "Address of the Strat")
    .addParam("amount", "New Min Rebalance Amount")
    .setAction(async (taskArgs, hre) => {
    const strat = (await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat)) as AAVEUSDCRewards
    console.log("deployed", strat.address)

    const newSet = await (await strat.setRebalanceAmount(taskArgs.amount, {gasLimit: 5000000})).wait()
    console.log("newsetTx", newSet.transactionHash)

    const newRebalanceAmount = await strat["minRebalanceAmount()"]()
    console.log("newRebalanceAmount", newRebalanceAmount.toString())
});
