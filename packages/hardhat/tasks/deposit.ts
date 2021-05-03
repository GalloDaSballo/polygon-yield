import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_DEPOSIT_ALL } from "./task-names";

task(TASK_DEPOSIT_ALL, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)


    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    (await (await deployed.depositAll({gasLimit: 3000000}))).wait()


});
