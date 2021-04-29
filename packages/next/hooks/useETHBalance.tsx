import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { User } from "../context/UserContext";
import getETHBalance from "../utils/getETHBalance";

const useETHBalance = (user: User): [BigNumber, () => Promise<void>] => {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"));

  const fetchUserETH = useCallback(async () => {
    if (!user) {
      setBalance(BigNumber.from("0"));
      return;
    }
    try {
      const ethBalance = await getETHBalance(user.provider);
      setBalance(ethBalance);
    } catch (err) {
      setBalance(BigNumber.from("0"));
    }
  }, [user]);

  useEffect(() => {
    fetchUserETH();
  }, [fetchUserETH]);

  return [balance, fetchUserETH];
};

export default useETHBalance;
