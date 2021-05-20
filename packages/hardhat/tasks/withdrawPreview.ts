import { task } from "hardhat/config";
import { MyieldVault } from "../typechain";

import { TASK_WITHDRAW_PREVIEW } from "./task-names";

task(TASK_WITHDRAW_PREVIEW, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();

    const vault = (await hre.ethers.getContract("MyieldVault")) as MyieldVault
    console.log("vault", vault.address)

    const myBalance = await vault.balanceOf(deployer)
    console.log("myBalance", myBalance.toString())



    const expectedWithdrawal = await vault.fromSharesToWithdrawal(myBalance, { gasLimit: 1000000 })
    console.log("expectedWithdrawal", expectedWithdrawal.toString())
});
