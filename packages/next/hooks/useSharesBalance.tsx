import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { User } from "../context/UserContext";
import getSharesBalance from "../utils/getSharesBalance";

const useSharesBalance = (user: User): [BigNumber, () => Promise<void>] => {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"));

  const fetchUserShares = useCallback(async () => {
    if (!user) {
      setBalance(BigNumber.from("0"));
      return;
    }
    try {
      const newBalance = await getSharesBalance(user.provider);
      setBalance(newBalance);
    } catch (err) {
      setBalance(BigNumber.from("0"));
    }
  }, [user]);

  useEffect(() => {
    fetchUserShares();
  }, [fetchUserShares]);

  return [balance, fetchUserShares];
};

export default useSharesBalance;
