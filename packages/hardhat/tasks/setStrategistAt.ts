import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, MyieldVault, AAVEUSDCRewards } from "../typechain";

import { TASK_SET_STRATEGIST_AT } from "./task-names";

task(TASK_SET_STRATEGIST_AT, "Set Strategist for Strat")
    .addParam("strat", "Address of the Strategy")
    .addParam("strategist", "Address of the Strategist")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const strat = await hre.ethers.getContractAt("AAVEUSDCRewards", taskArgs.strat) as AAVEUSDCRewards

    const addStratTx = await (await strat.setStrategist(taskArgs.strategist)).wait()
    console.log("addStratTx", addStratTx)
});
