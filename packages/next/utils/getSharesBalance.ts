import { BigNumber, ethers, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";
/**
 * Get the shares Balance
 * @param provider
 * @returns
 */
const getSharesBalance = async (
  provider: ethers.providers.Web3Provider
): Promise<BigNumber> => {
  const vault = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const balance = await vault.balanceOf(
    await provider.getSigner().getAddress()
  );
  return balance;
};

export default getSharesBalance;
