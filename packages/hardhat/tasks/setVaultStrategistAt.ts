import { task } from "hardhat/config";
import { MyieldDCAVault } from "../typechain";

import { TASK_SET_VAULT_STRATEGIST_AT } from "./task-names";

task(TASK_SET_VAULT_STRATEGIST_AT, "Set Strategist for Strat")
    .addParam("vault", "Address of the Vault")
    .addParam("strategist", "Address of the Strategist")
    .setAction(async (taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const strat = await hre.ethers.getContractAt("MyieldDCAVault", taskArgs.vault) as MyieldDCAVault

    const addStratTx = await (await strat.setStrategist(taskArgs.strategist)).wait()
    console.log("addStratTx", addStratTx)
});
