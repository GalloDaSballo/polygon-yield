import { task } from "hardhat/config";
import { Myield, MyieldWMatic } from "../typechain";

import { TASK_REBALANCE } from "./task-names";

task(TASK_REBALANCE, "Prints the list of accounts", async (_taskArgs, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    
    const deployed = (await hre.ethers.getContract("MyieldWMatic")) as MyieldWMatic

    await (await deployed.rebalance({ gasLimit: 5000000 })).wait()

});
