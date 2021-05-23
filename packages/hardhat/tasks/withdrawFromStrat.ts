import { task } from "hardhat/config";
import { AAVEUSDCRewards } from "../typechain";

import { TASK_WITHDRAW_STRAT } from "./task-names";

task(TASK_WITHDRAW_STRAT, "Prints the list of accounts", async (_taskArgs, hre) => {
    const strat = (await hre.ethers.getContract("AAVEUSDCRewards")) as AAVEUSDCRewards


    const res = await(await strat["divest()"]({gasLimit: 5000000})).wait();
    console.log("res", res.transactionHash)
});
