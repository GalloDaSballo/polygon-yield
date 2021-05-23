import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { AAVEUSDCRewards, ERC20, Myield, MyieldWMatic } from "../typechain";

import { TASK_DEPOSIT_AT } from "./task-names";

task(TASK_DEPOSIT_AT, "Prints the list of accounts")
    .addParam("vault", "Address of the Vault")
    .addParam("strat", "Address of the Strat")
    .addParam("amount", "Amount to deposit")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const vault = (await hre.ethers.getContractAt("MyieldWMatic", taskArgs.vault)) as MyieldWMatic
    const want = await vault["want()"]()
    const token = (await hre.ethers.getContractAt("Myield", want)) as ERC20

    const strat = await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat) as AAVEUSDCRewards

    const toDeposit = BigNumber.from(taskArgs.amount)

    if(toDeposit.gt(0)){
        await (await token["approve(address,uint256)"](vault.address, toDeposit)).wait()
        const depositInVaultTx = await (await vault.deposit(toDeposit, { gasLimit: 500000 })).wait()
        console.log("depositInVaultTx", depositInVaultTx.transactionHash)

        const depositInStratTx = await (await strat.deposit(toDeposit, {gasLimit: 5000000})).wait()
        console.log("depositInStratTx", depositInStratTx.transactionHash)
    } else {
        console.log("No value")
    }

});
