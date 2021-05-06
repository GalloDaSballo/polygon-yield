import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MyieldWMatic } from "../typechain";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deployer } = await getNamedAccounts();
    console.log("deployer", deployer)

    const deployed = await deployments.deploy("MyieldWMatic", {
        from: deployer,
        log: true
    });

    const instance = await hre.ethers.getContractAt("MyieldWMatic", deployed.address) as MyieldWMatic;
    await (await instance.setStrategist("0xC268996d74A819239aDC5d10191Cc84785ff0a53")).wait() // Bot for rebalancing

};

export default func;
