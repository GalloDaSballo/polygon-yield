import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, MyieldVault, AAVEUSDCRewards } from "../typechain";

import { TASK_STRAT_HARVEST } from "./task-names";

task(TASK_STRAT_HARVEST, "Deposit USDC into The Vault", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const vault = (await hre.ethers.getContract("MyieldVault")) as MyieldVault
    const strat = await hre.ethers.getContract("AAVEUSDCRewards") as AAVEUSDCRewards
    console.log("vault add", vault.address)
    console.log("start add", vault.address)
    
   
    console.log("** REWARDS AMOUNT **")
    const rewardsAmount = await strat.getRewardsAmount()
    console.log("rewardsAmount", rewardsAmount.toString())
    
    console.log("** ORACLE AMOUNT **")
    // Amount * 18 decimals * 99 / 10e12 (12 decimals difference) / feedValue / 100
    const amountMin = rewardsAmount.mul("1000000000000000000").mul(99).div("1000000000000").div("518285098260000000").div(100); // 99% of converted from cached ratio
    console.log("amountMin", amountMin.toString())

    const minOutcome = await strat.getMinOutputAmount(rewardsAmount, "518285098260000000")
    console.log("minOutcome", minOutcome.toString())

    console.log("/** TOTAL VALUES */")
    const vaultTotalValue = await vault.getTotalValue()
    console.log("vaultTotalValue", vaultTotalValue.toString())

    const valueInStrat = await strat.getTotalValue()
    console.log("valueInStrat", valueInStrat.toString())


    console.log("/** HARVEST IN STRAT **/")
    const harvestTx = await (await strat.harvest("518285098260000000", {gasLimit: 5000000})).wait()
    console.log("Harvest tx", harvestTx.transactionHash)

});
