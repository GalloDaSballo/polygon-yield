import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_WITHDRAW } from "./task-names";

task(TASK_WITHDRAW, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield

    
    const balance = await deployed.balanceOf(deployer, { gasLimit: 1000000 })
    console.log("balance", balance.toString())

    
    if(balance.gt(0)){
        await (await deployed.withdraw(balance, { gasLimit: 5000000 })).wait()
    } else {
        console.log("No value")
    }
});
