import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, MyieldVault, AAVEUSDCRewards } from "../typechain";

import { TASK_REBALANCE_STRAT } from "./task-names";

task(TASK_REBALANCE_STRAT, "Deposit USDC into The Vault", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    console.log("")

    const vault = (await hre.ethers.getContractAt("MyieldVault", "0x404ABc76561De735b3206DD7A6b8FaD83155f673")) as MyieldVault
    const strat = await hre.ethers.getContractAt("AAVEUSDCRewards", "0x445ABfA5FFB48279Db2988bB20e36d64c74F363a") as AAVEUSDCRewards

    const toDeposit = await vault.balanceOfWant()
    console.log("toDeposit", toDeposit.toString())

    console.log("/** DEPOSIT IN STRAT **/")
    console.log("strat", strat.address)

    const depTx = await (await strat.deposit(toDeposit, { gasLimit: 500000 })).wait()
    console.log("dep tx", depTx.transactionHash)

    console.log("/** INVEST DEEP IN STRAT **/")
    const investTx = await (await strat.invest({ gasLimit: 5000000 })).wait()
    console.log("dep tx", investTx.transactionHash)

});
