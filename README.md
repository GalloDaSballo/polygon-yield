# Myield Monorepo

## Contracts and Documentation
https://www.notion.so/Myield-Earn-Matic-with-your-Matic-257288aff5b74be9b37728c6b7d28a28

## Vaults Addresses

Myield wMatic Vault:
0x9dB2A331fbD4cEA56450f3A0a9b983bC52ec7387

Myield USDC Vault:
0x792233693f028d8f569AB2cB5bCCF67245702dc8

AAVE USDC Strat:
0xe1aB1eE2c63347951d72BD3ee9597088084Ed221

Myield wBTC Vault:
0x404ABc76561De735b3206DD7A6b8FaD83155f673

AAVE wBTC Strat:
0x7709BA99cF5A2544aebf2bB149a420C6D8C3D227

USDC to wBTC DCA Vault
0xD0E05D1C314Cbd51e0e76A71Dc7A0CcdDAcbCCe1

USDC Strat
0xEed13F8A0Ad6A8cac6d54D1C89c180eBe4E95153


# Monorepo setup using:
- Solidity Template by @TomAFrench and @paulrberg
- NextJS with Typescript and EsLint
- theGraph


## hardhat
The contracts, with tests and tasks to publish new content, using Solidity Template

## next
The UI for the website, to interact with the protocol and publish new content, using NextJS

## subgraph
The subgraph code to track new posts, using TheGraph

# Commands

## Shortcuts
```
yarn hardhat
```
```
yarn next
```
```
yarn subgraph
```

### Example: Deploy with Hardhat
```
yarn hardhat deploy
```

### Example Run NextJS in Development Mode
```
yarn next dev
```

# Setup Hardhat

Rename `.env.example` to `.env` and fill in the details

# Setup Subgraph

Rename `YOU_GITHUB/SUB_GRAPHNAME` in `subgraph/package.json`
