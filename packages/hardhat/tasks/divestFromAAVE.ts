import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { Myield } from "../typechain";

import { TASK_DIVEST } from "./task-names";

task(TASK_DIVEST, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    const withdrawal = await (await deployed.divestFromAAVE(BigNumber.from("1849999218936269361"), { gasLimit: 6000000 })).wait()
    console.log("Divested!")

});
