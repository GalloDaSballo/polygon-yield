import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { AAVEUSDCRewards, ERC20, Myield, MyieldWMatic } from "../typechain";

import { TASK_WITHDRAW_AT } from "./task-names";

task(TASK_WITHDRAW_AT, "Prints the list of accounts")
    .addParam("vault", "Address of the Vault")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const vault = (await hre.ethers.getContractAt("MyieldWMatic", taskArgs.vault)) as MyieldWMatic
    const balance = await vault.balanceOf(deployer)

    if(balance.gt(0)){
        const withdrawTx = await (await vault.withdraw(balance, {gasLimit: 3000000})).wait()
        console.log("withdrawTx", withdrawTx.transactionHash)
    } else {
        console.log("No value")
    }

});
