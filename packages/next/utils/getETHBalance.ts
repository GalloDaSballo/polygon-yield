import { BigNumber, ethers } from "ethers";

/**
 * Get the "gas" balance
 * Will show MATIC on Matic Chain, ETH on Ethereum
 * @param provider
 * @returns
 */
const getETHBalance = async (
  provider: ethers.providers.Web3Provider
): Promise<BigNumber> => {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);
  return balance;
};

export default getETHBalance;
