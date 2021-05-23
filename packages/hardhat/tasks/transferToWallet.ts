import { task } from "hardhat/config";
import { ERC20, MyieldWMatic } from "../typechain";

import { TASK_TRANSFER_TO_WALLET } from "./task-names";

task(TASK_TRANSFER_TO_WALLET, "Prints the list of accounts")
    .addParam("token", "Address of Token")
    .addParam("amount", "Amount of Token")
    .addParam("wallet", "Address of wallet to send to")
    .setAction(async (taskArgs, hre) => {

    const token = (await hre.ethers.getContractAt("MyieldWMatic", taskArgs.token)) as ERC20
    
    const sendTx = await (await token.transfer(taskArgs.wallet, taskArgs.amount)).wait()
    console.log("sendTx", sendTx.transactionHash)
});
