import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { ERC20, Myield } from "../typechain";

import { TASK_WITHDRAW_FROM_POOL } from "./task-names";

task(TASK_WITHDRAW_FROM_POOL, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = (await hre.ethers.getContract("Myield")) as Myield
    const withdrawal = await (await deployed.withdrawFromAAVE(BigNumber.from("1000000000000000000"), {gasLimit: 5000000})).wait()
    console.log("Withdrawal!")

});
