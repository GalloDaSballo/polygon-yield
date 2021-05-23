import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { User } from "../context/UserContext";
import getERC20Balance from "../utils/getERC20Balance";

const useERC20Balance = (user: User, address: string): BigNumber => {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"));

  const fetchUserBalance = useCallback(async () => {
    if (!user) {
      setBalance(BigNumber.from("0"));
      return;
    }
    try {
      const newBalance = await getERC20Balance(user.provider, address);
      setBalance(newBalance);
    } catch (err) {
      setBalance(BigNumber.from("0"));
    }
  }, [user, address]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserBalance();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchUserBalance]);

  return balance;
};

export default useERC20Balance;
