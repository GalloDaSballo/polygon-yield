import { task } from "hardhat/config";
import { MyieldVault } from "../typechain";

import { TASK_REMOVE_STRATS } from "./task-names";

task(TASK_REMOVE_STRATS, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    const deployed = (await hre.ethers.getContract("MyieldVault")) as MyieldVault
    console.log("deployed", deployed.address)

    // Reinvest before rebalancing to ensure you can 
    let res = "null"
    let count = 0;
    while(res != hre.ethers.constants.AddressZero){
        console.log("Removing", count)
        const strat = await (await deployed["removeStrategy(uint256)"](count)).wait();
        console.log("strat", strat.transactionHash)
    }
});
