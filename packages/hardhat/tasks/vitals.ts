import { task } from "hardhat/config";
import { ILendingPool, Myield } from "../typechain";

import { TASK_VITALS } from "./task-names";

task(TASK_VITALS, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    

    


    const [owed, canBorrow, getTotalValue, balanceOfWant, minHealth, deposited ] = 
         await Promise.all([await deployed.owed(), await deployed.canBorrow(), await deployed.getTotalValue(), await deployed.balanceOfWant(), await deployed.MIN_HEALTH(), await deployed.deposited()])
    
    
    console.log("owed", hre.ethers.utils.formatEther(owed))
    console.log("canBorrow", hre.ethers.utils.formatEther(canBorrow))
    console.log("getTotalValue", hre.ethers.utils.formatEther(getTotalValue))
    console.log("balanceOfWant", hre.ethers.utils.formatEther(balanceOfWant))
    console.log("minHealth", hre.ethers.utils.formatEther(minHealth))
    console.log("deposited", hre.ethers.utils.formatEther(deposited))
    
    

    
});
