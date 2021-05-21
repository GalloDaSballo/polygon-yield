import vaultData from "@mono/hardhat/deployments/matic/MyieldVault.json";
import { Vault } from "../types";

const vaults: Vault[] = [
  {
    name: "USDC Vault",
    symbol: "MyYieldUSDC",
    address: "0x792233693f028d8f569AB2cB5bCCF67245702dc8",
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
    decimals: 6,
    rewardsStrat: "0xe1aB1eE2c63347951d72BD3ee9597088084Ed221",
    want: {
      name: "USD Coin",
      symbol: "USDC",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      logoURI:
        "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
      decimals: 6,
    },
  },
  {
    address: "0x404ABc76561De735b3206DD7A6b8FaD83155f673",
    name: "WBTC Vault",
    symbol: "MyYieldWBTC",
    decimals: 8,
    logoURI:
      "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1548822744",
    rewardsStrat: "0x7709BA99cF5A2544aebf2bB149a420C6D8C3D227",
    want: {
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      decimals: 8,
      logoURI:
        "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1548822744",
    },
  },
];

export default vaults;

export const VAULT_ABI = vaultData.abi;
