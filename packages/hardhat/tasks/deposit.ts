import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_DEPOSIT } from "./task-names";

task(TASK_DEPOSIT, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const wMatic = (await hre.ethers.getContractAt("Myield", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270")) as ERC20
    const balance = await wMatic.balanceOf(deployer)
    console.log("balance", balance.toString())


    const toDeposit = balance

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    if(toDeposit.gt(0)){
        await (await wMatic["approve(address,uint256)"](deployed.address, toDeposit)).wait()
        await (await deployed.deposit(toDeposit, { gasLimit: 500000 })).wait()
    } else {
        console.log("No value")
    }

});
