# Myield Monorepo

## Contracts and Documentation
https://www.notion.so/Myield-Earn-Matic-with-your-Matic-257288aff5b74be9b37728c6b7d28a28

## Vaults Addresses and Hardhat Tasks
https://www.notion.so/Vaults-V2-99627601139d4a97aefc29986cb48ced

## USDC to wBTC DCA Vault
https://www.notion.so/DCA-Vaults-V1-EXPERIMENTAL-1fe884169f554f9f9a29d3642c0dff96


Monorepo setup using:
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
