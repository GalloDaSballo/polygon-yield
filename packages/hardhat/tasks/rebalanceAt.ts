import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, MyieldVault, AAVEUSDCRewards } from "../typechain";

import { TASK_REBALANCE_AT } from "./task-names";

task(TASK_REBALANCE_AT, "Deposit USDC into The Vault")
    .addParam("vault", "Address of the Vault")
    .addParam("strat", "Address of the Strategy")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    console.log("")

    const vault = (await hre.ethers.getContractAt("MyieldVault", taskArgs.vault)) as MyieldVault
    const strat = await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat) as AAVEUSDCRewards

    const toDeposit = await vault.balanceOfWant()
    console.log("toDeposit", toDeposit.toString())

    console.log("/** DEPOSIT IN STRAT **/")
    console.log("strat", strat.address)
    if(toDeposit.gt(0)){
        const depTx = await (await strat.deposit(toDeposit, { gasLimit: 500000 })).wait()
        console.log("dep tx", depTx.transactionHash)
    }

    console.log("/** INVEST DEEP IN STRAT **/")
    const investTx = await (await strat.invest({ gasLimit: 5000000 })).wait()
    console.log("dep tx", investTx.transactionHash)

});
