import { task } from "hardhat/config";
import { AAVEUSDCRewards } from "../typechain";

import { TASK_STRAT_VITALS } from "./task-names";

task(TASK_STRAT_VITALS, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("AAVEUSDCRewards")) as AAVEUSDCRewards
    
    const [owed, canBorrow, getTotalValue, balanceOfWant, minHealth, deposited, stats, shouldInvest, shouldDivest, decimals] = 
         await Promise.all([await deployed.owed(), await deployed.canBorrow(), await deployed.getTotalValue(), await deployed.balanceOfWant(), await deployed["minHealth()"](), await deployed.deposited(), await deployed.stats(), await deployed.shouldInvest(), await deployed.shouldDivest(), await deployed["decimals()"]()])
    
    
    
    console.log("canBorrow", hre.ethers.utils.formatUnits(canBorrow, 6))
    console.log("getTotalValue", hre.ethers.utils.formatUnits(getTotalValue, 6))
    console.log("balanceOfWant", hre.ethers.utils.formatUnits(balanceOfWant, 6))
    
    
    console.log("stats", stats)
    console.log("healthFactor", hre.ethers.utils.formatUnits(stats.healthFactor, 18))
    console.log("availableBorrowsETH", hre.ethers.utils.formatUnits(stats.availableBorrowsETH, 18))
    console.log("shouldInvest", shouldInvest)
    console.log("shouldDivest", shouldDivest)

    console.log("** CAN BORROW LOGIC **")
    
    console.log("deposited", hre.ethers.utils.formatUnits(deposited, 6))
    console.log("stats.ltv", stats.ltv.toString())
    console.log("decimals", decimals)
    console.log("minHealth", hre.ethers.utils.formatUnits(minHealth, 18))
    console.log("owed", hre.ethers.utils.formatUnits(owed, 6))
    console.log("Mul", hre.ethers.utils.formatUnits(1e6, 6))

    //1000000000000000000 10e18
    const maxValue = deposited.mul(stats.ltv).mul("1000000000000000000").div(10000).div(minHealth).sub(owed)
    console.log("maxValue", hre.ethers.utils.formatUnits(maxValue, 6))

    
});
