import { task } from "hardhat/config";
import { MyieldVault, AAVEUSDCRewards, ERC20 } from "../typechain";

import { TASK_HARVEST_AT } from "./task-names";

task(TASK_HARVEST_AT, "Deposit USDC into The Vault")
    .addParam("strat", "Address of the Strategy")
    .addParam("oracleprice", "18 decimals Oracle Price of Want Asset")
    .setAction(async (taskArgs, hre) => {
        const { deployer } = await hre.getNamedAccounts();
        console.log("deployer", deployer)

        const strat = await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat) as AAVEUSDCRewards
        console.log("strat", strat.address)

        const want = await strat["want()"]()
        console.log("want", want)

        console.log("** REWARDS AMOUNT **")
        const rewardsAmount = await strat.getRewardsAmount()
        console.log("rewardsAmount", rewardsAmount.toString())
        

        const minOutcome = await strat.getMinOutputAmount(rewardsAmount, taskArgs.oracleprice)
        console.log("minOutcome", minOutcome.toString())

        console.log("/** TOTAL VALUES */")
        const valueInStrat = await strat.getTotalValue()
        console.log("valueInStrat", valueInStrat.toString())


        console.log("/** HARVEST IN STRAT **/")
        const harvestTx = await (await strat.harvest(taskArgs.oracleprice, {gasLimit: 5000000})).wait()
        console.log("Harvest tx", harvestTx.transactionHash)

});
