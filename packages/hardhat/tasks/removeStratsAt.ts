import { task } from "hardhat/config";
import { MyieldVault } from "../typechain";

import { TASK_REMOVE_STRATS_AT } from "./task-names";

task(TASK_REMOVE_STRATS_AT, "Prints the list of accounts") 
    .addParam("vault", "Address of the Vault")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    const deployed = (await hre.ethers.getContractAt("MyieldVault", taskArgs.vault)) as MyieldVault
    console.log("deployed", deployed.address)
    
    let res = "null"
    let count = 0;
    while(res != hre.ethers.constants.AddressZero){
        console.log("Removing", count)
        const strat = await (await deployed["removeStrategy(uint256)"](count)).wait();
        console.log("strat", strat.transactionHash)
    }
});
