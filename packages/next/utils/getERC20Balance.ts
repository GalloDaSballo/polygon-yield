import { BigNumber, ethers, Contract } from "ethers";
import { WMATIC_ABI } from "./constants";
/**
 * Get the getERC20Balance Balance
 * @param provider
 * @returns
 */
const getERC20Balance = async (
  provider: ethers.providers.Web3Provider,
  address: string
): Promise<BigNumber> => {
  const erc20 = new Contract(address, WMATIC_ABI, provider);
  const balance = await erc20.balanceOf(
    await provider.getSigner().getAddress()
  );
  return balance;
};

export default getERC20Balance;
