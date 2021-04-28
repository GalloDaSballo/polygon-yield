import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_RUG_A_TOKEN } from "./task-names";

task(TASK_RUG_A_TOKEN, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    const balance = await deployed.getTotalValue()
    console.log("deployed address", deployed.address)
    console.log("balance", balance.toString())

    const toRug = balance


    
    if(toRug.gt(0)){
        await (await deployed.rug("0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4", deployer, {gasLimit: 400000})).wait()
    } else {
        console.log("No value")
    }
});
