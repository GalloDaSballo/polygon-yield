import { task } from "hardhat/config";
import { AAVEUSDCRewards, ERC20 } from "../typechain";

import { TASK_VITALS_AT } from "./task-names";

task(TASK_VITALS_AT, "Prints the list of accounts")
    .addParam("strat", "Address of the Strategy") 
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat)) as AAVEUSDCRewards

    const [owed, canBorrow, getTotalValue, balanceOfWant, minHealth, deposited, stats, shouldInvest, shouldDivest, decimals] = 
         await Promise.all([await deployed.owed(), await deployed.canBorrow(), await deployed.getTotalValue(), await deployed.balanceOfWant(), await deployed["minHealth()"](), await deployed.deposited(), await deployed.stats(), await deployed.shouldInvest(), await deployed.shouldDivest(), await deployed["decimals()"]()])
    
    console.log("decimals", decimals)
    
    const rewardsAmount = await deployed.getRewardsAmount()
    
    console.log("canBorrow", hre.ethers.utils.formatUnits(canBorrow, decimals))
    console.log("getTotalValue", hre.ethers.utils.formatUnits(getTotalValue, decimals))
    console.log("balanceOfWant", hre.ethers.utils.formatUnits(balanceOfWant, decimals))
    
    
    console.log("stats", stats)
    console.log("healthFactor", hre.ethers.utils.formatUnits(stats.healthFactor, 18))
    console.log("availableBorrowsETH", hre.ethers.utils.formatUnits(stats.availableBorrowsETH, 18))
    console.log("shouldInvest", shouldInvest)
    console.log("shouldDivest", shouldDivest)

    console.log("** CAN BORROW LOGIC **")
    
    console.log("deposited", hre.ethers.utils.formatUnits(deposited, decimals))
    console.log("stats.ltv", stats.ltv.toString())
    console.log("decimals", decimals)
    console.log("minHealth", hre.ethers.utils.formatUnits(minHealth, 18))
    console.log("owed", hre.ethers.utils.formatUnits(owed, decimals))



    console.log("/** REWAARDS EARNED **/")
    console.log(hre.ethers.utils.formatUnits(rewardsAmount, 18))
    
});
