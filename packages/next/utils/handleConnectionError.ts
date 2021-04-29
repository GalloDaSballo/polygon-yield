import { UnsupportedChainIdError } from "@web3-react/core";

/**
 * Given an error show a message to help the user
 * @param error
 * @returns
 */
const handleConnetionError = (error: Error): string => {
  const isWrongChain = error instanceof UnsupportedChainIdError;
  if (isWrongChain) {
    return "You are connected to the wrong chain, switch to Matic";
  }
  return "There was an issue with connecting to Metamask, make sure you are using Matic";
};

export default handleConnetionError;
