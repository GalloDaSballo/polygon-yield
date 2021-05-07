import { HardhatUserConfig } from "hardhat/config";
import { ChainId, getRemoteNetworkConfig, mnemonic } from "./config";
import "./tasks";

import "hardhat-deploy";
// To make hardhat-waffle compatible with hardhat-deploy
// we have aliased hardhat-ethers to hardhat-ethers-deploy in package.json
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";
import { HardhatNetworkAccountsUserConfig } from "hardhat/types";

const accounts = {
    count: 10,
    initialIndex: 0,
    mnemonic,
    path: "m/44'/60'/0'/0",
};

/**
 * @dev You must have a `.env` file. Follow the example in `.env.example`.
 * @param {string} network The name of the testnet
 */
 function createMaticNetworkConfig(
    url: string,
): { accounts: HardhatNetworkAccountsUserConfig; url: string | undefined } {
    if (!process.env.MNEMONIC) {
        throw new Error("Please set your MNEMONIC in a .env file");
    }

    return {
        accounts: {
            count: 10,
            initialIndex: 0,
            mnemonic: process.env.MNEMONIC,
            path: "m/44'/60'/0'/0",
        },
        url,
    };
}


const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    namedAccounts: {
        deployer: 0, // Do not use this account for testing
        admin: 1,
    },
    networks: {
        hardhat: {
            chainId: ChainId.hardhat,
            saveDeployments: false,
        },
        goerli: { accounts, ...getRemoteNetworkConfig("goerli") },
        kovan: { accounts, ...getRemoteNetworkConfig("kovan") },
        rinkeby: { accounts, ...getRemoteNetworkConfig("rinkeby") },
        ropsten: { accounts, ...getRemoteNetworkConfig("ropsten") },
        matic: {
            ...createMaticNetworkConfig(String(process.env.MATIC_VIGIL_MATIC_URL)),
            chainId: 137,
            gasPrice: 1e9, // 1 gwei
        },
        mumbai: {
            ...createMaticNetworkConfig(String(process.env.MATIC_VIGIL_MUMBAI_URL)),
            chainId: 80001,
            gasPrice: 1e9, // 1 gwei
        },
    },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
    },
    mocha: {
        timeout: 120000
    },
    solidity: {
        compilers: [
            {
                version: "0.7.5",
                settings: {
                    // https://hardhat.org/hardhat-network/#solidity-optimizer-support
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    evmVersion: 'istanbul'
                },
            },
            {
                version: "0.6.12",
                settings: {
                    // https://hardhat.org/hardhat-network/#solidity-optimizer-support
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                    evmVersion: 'istanbul'
                },
            }
        ]
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
};

export default config;
