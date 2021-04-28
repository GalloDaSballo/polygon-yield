import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_REWARDS } from "./task-names";

task(TASK_REWARDS, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    
    const rewards = await deployed.getRewardsBalance();
    console.log("rewards", rewards.toString());

    const gasCost = hre.ethers.utils.parseUnits("316850", "gwei")
    console.log("gasCost", gasCost.toString())

    if(gasCost.lt(rewards)){
        const tx = await (await deployed["reinvestRewards()"]({gasLimit: 6000000})).wait();
        console.log("tx", tx.transactionHash);
    } else {
        console.log("Not worth reinvesting")
    }

});
