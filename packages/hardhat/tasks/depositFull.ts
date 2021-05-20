import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, MyieldVault, AAVEUSDCRewards } from "../typechain";

import { TASK_DEPOSIT_FULL } from "./task-names";

task(TASK_DEPOSIT_FULL, "Deposit USDC into The Vault", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const vault = (await hre.ethers.getContract("MyieldVault")) as MyieldVault
    const strat = await hre.ethers.getContract("AAVEUSDCRewards") as AAVEUSDCRewards
    console.log("vault add", vault.address)
    console.log("start add", vault.address)

    console.log("/** TOTAL VALUES BEFORE */")
    const vaultTotalValueBefore = await vault.getTotalValue()
    console.log("vaultTotalValueBefore", vaultTotalValueBefore.toString())

    const valueInStratBefore = await strat.getTotalValue()
    console.log("valueInStratBefore", valueInStratBefore.toString())

    const usdc = (await hre.ethers.getContractAt("Myield", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174")) as ERC20
    const balance = await usdc.balanceOf(deployer)
    console.log("balance before starting", balance.toString())


    const toDeposit = BigNumber.from(hre.ethers.utils.parseUnits("100", 6))
    console.log("toDeposit", toDeposit.toString())

    console.log("/** DEPOSIT **")
    console.log("vault address", vault.address)
    if(toDeposit.gt(0)){
        await (await usdc["approve(address,uint256)"](vault.address, toDeposit)).wait()
        const usdcDepTx = await (await vault.deposit(toDeposit, { gasLimit: 500000 })).wait()
        console.log("usdcDepTx", usdcDepTx.transactionHash)
    } else {
        console.log("No value")
    }

    
   

    console.log("/** DEPOSIT IN STRAT **/")
    console.log("strat", strat.address)

    const depTx = await (await strat.deposit(toDeposit, { gasLimit: 500000 })).wait()
    console.log("dep tx", depTx.transactionHash)

    console.log("/** INVEST DEEP IN STRAT **/")
    const investTx = await (await strat.invest({ gasLimit: 5000000 })).wait()
    console.log("dep tx", investTx.transactionHash)

    console.log("** REWARDS AMOUNT **")
    const rewardsAmount = await strat.getRewardsAmount()
    console.log("rewardsAmount", rewardsAmount.toString())

    // Call stratHarvest for these operations
    
    // console.log("** ORACLE AMOUNT **")
    // // Amount * 18 decimals * 99 / 10e12 (12 decimals difference) / feedValue / 100
    // const amountMin = rewardsAmount.mul("1000000000000000000").mul(99).div("1000000000000").div("514472000000000000").div(100); // 99% of converted from cached ratio
    // console.log("amountMin", amountMin.toString())

    // const minOutcome = await strat.getMinOutputAmount(rewardsAmount, "514472000000000000")
    // console.log("minOutcome", minOutcome.toString())

    // console.log("/** TOTAL VALUES */")
    // const vaultTotalValue = await vault.getTotalValue()
    // console.log("vaultTotalValue", vaultTotalValue.toString())

    // const valueInStrat = await strat.getTotalValue()
    // console.log("valueInStrat", valueInStrat.toString())

    // console.log("/** WITHDRAW */")
    // const sharesToWithdraw = await vault.balanceOf(deployer)
    // console.log("sharesToWithdraw", sharesToWithdraw.toString())

    // const withdrawal = await (await vault.withdraw(sharesToWithdraw)).wait()
    // console.log("Withdrawal tx", withdrawal.transactionHash)

    // const afterBalance = await usdc.balanceOf(deployer)
    // console.log("balance after withdrawing", afterBalance.toString())

    // console.log("/** HARVEST IN STRAT **/")
    // const harvestTx = await (await strat.harvest("603482091660000000", {gasLimit: 5000000})).wait()
    // console.log("Harvest tx", harvestTx.transactionHash)

});
