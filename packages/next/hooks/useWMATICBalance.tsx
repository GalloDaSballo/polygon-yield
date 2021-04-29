import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { User } from "../context/UserContext";
import getWMATICBalance from "../utils/getWMATICBalance";

const useWMATICBalance = (user: User): [BigNumber, () => Promise<void>] => {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"));

  const fetchUserWMATIC = useCallback(async () => {
    if (!user) {
      setBalance(BigNumber.from("0"));
      return;
    }
    try {
      const newBalance = await getWMATICBalance(user.provider);
      setBalance(newBalance);
    } catch (err) {
      setBalance(BigNumber.from("0"));
    }
  }, [user]);

  useEffect(() => {
    fetchUserWMATIC();
  }, [fetchUserWMATIC]);

  return [balance, fetchUserWMATIC];
};

export default useWMATICBalance;
