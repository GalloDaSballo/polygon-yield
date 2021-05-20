import { task } from "hardhat/config";
import { ERC20, MyieldVault } from "../typechain";

import { TASK_WITHDRAW_NEW } from "./task-names";

task(TASK_WITHDRAW_NEW, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();

    const deployed = (await hre.ethers.getContract("MyieldVault")) as MyieldVault
    const usdc = (await hre.ethers.getContractAt("MyieldVault", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174")) as ERC20
    console.log("deployed", deployed.address)
    
    const sharesBalance = await deployed.balanceOf(deployer, { gasLimit: 1000000 })
    console.log("balance", sharesBalance.toString())
    
    const beforeBalance = await usdc.balanceOf(deployer)
    console.log("balance before withdrawing", beforeBalance.toString())


    const tvl = await deployed.getTotalValue();
    console.log("tvl", tvl.toString())

    // Reinvest before rebalancing to ensure you can 
    if(sharesBalance.gt(0)){
        console.log("Withdrawing")
        const withdrawRes = await (await deployed.withdraw(sharesBalance, { gasLimit: 5000000 })).wait()
        console.log("Withdrawal Tx", withdrawRes.transactionHash)
    } else {
        console.log("No value")
    }

    const afterBalance = await usdc.balanceOf(deployer)
    console.log("balance after withdrawing", afterBalance.toString())
});
