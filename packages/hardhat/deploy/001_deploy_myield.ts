import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deployer } = await getNamedAccounts();
    console.log("deployer", deployer)

    await deployments.deploy("Myield", {
        from: deployer,
        log: true
    });
};

export default func;
