import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { AAVEUSDCRewards, MyieldVault } from "../typechain";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deployer } = await getNamedAccounts();
    console.log("deployer", deployer)

    // 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 USDC
    // 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270 WMATIC
    // 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6 wBTC
    const WANT = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
    /** Construct Vault */
    const vault = await deployments.deploy("MyieldVault", {
      from: deployer,
      args: [WANT], // want
      log: true,
    })

    /** Deploy Strat First */
    const strategy = await deployments.deploy("AAVEUSDCRewards", {
        from: deployer,
        args: [
          WANT,
          vault.address,
          "0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf", // Lending Pool
          "0xd05e3E715d945B59290df0ae8eF85c1BdB684744", // Address Provider
          hre.ethers.utils.parseUnits("1.3", 18), // 1.3 with 18 decimals because AAVE always uses 18 decimals
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // Wmatic
        ],
        log: true,
    });


    /** Set Strategist for Strat */
    const stratInstance = await hre.ethers.getContractAt("AAVEUSDCRewards", strategy.address) as AAVEUSDCRewards;
    await (await stratInstance.setStrategist(deployer)).wait() // For now it's going to be deployer


    const vaultInstant = await hre.ethers.getContractAt("MyieldVault", vault.address) as MyieldVault;
    console.log("stratInstance", stratInstance.address)
    await (await vaultInstant["addStrategy(address)"](stratInstance.address, {gasLimit: 3000000})).wait()
};

export default func;
