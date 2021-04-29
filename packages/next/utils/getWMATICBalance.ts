import { BigNumber, ethers, Contract } from "ethers";
import { WMATIC_ABI, WMATIC_ADDR } from "./constants";
/**
 * Get the WMATIC Balance
 * @param provider
 * @returns
 */
const getWMATICBalance = async (
  provider: ethers.providers.Web3Provider
): Promise<BigNumber> => {
  const wMatic = new Contract(WMATIC_ADDR, WMATIC_ABI, provider);
  const balance = await wMatic.balanceOf(
    await provider.getSigner().getAddress()
  );
  return balance;
};

export default getWMATICBalance;
