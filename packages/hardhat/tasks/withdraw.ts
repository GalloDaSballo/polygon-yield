import { task } from "hardhat/config";
import { MyieldWMatic } from "../typechain";

import { TASK_WITHDRAW } from "./task-names";

task(TASK_WITHDRAW, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer, admin } = await hre.getNamedAccounts();
    console.log("deployer", deployer)
    console.log("admin", admin)

    const deployed = (await hre.ethers.getContract("MyieldWMatic", admin)) as MyieldWMatic
    console.log("deployed", deployed.address)
    
    const balance = await deployed.balanceOf(admin, { gasLimit: 1000000 })
    console.log("balance", balance.toString())

    // Reinvest before rebalancing to ensure you can 
    if(balance.gt(0)){
        console.log("Reinvesting")
        // await (await deployed["reinvestRewards()"]({ gasLimit: 5000000 })).wait()
        console.log("Withdrawing")
        await (await deployed.withdraw(balance, { gasLimit: 5000000 })).wait()
    } else {
        console.log("No value")
    }
});
