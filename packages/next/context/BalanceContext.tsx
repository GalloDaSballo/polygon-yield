import { BigNumber } from "ethers";
import { createContext, useEffect, useContext } from "react";
import useETHBalance from "../hooks/useETHBalance";
import useSharesBalance from "../hooks/useSharesBalance";
import useWMATICBalance from "../hooks/useWMATICBalance";
import { useUser } from "./UserContext";

type BalanceContextData = {
  matic: BigNumber | null;
  wMatic: BigNumber | null;
  shares: BigNumber | null;
};

const BalanceContext = createContext<BalanceContextData>({
  matic: null,
  wMatic: null,
  shares: null,
});
export default BalanceContext;

export const BalanceContextProvider: React.FC = ({ children }) => {
  const user = useUser();
  const [matic, reloadETH] = useETHBalance(user);
  const [wMatic, reloadWMATIC] = useWMATICBalance(user);
  const [shares, reloadShares] = useSharesBalance(user);

  // Reload balances and allowance every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      reloadETH();
      reloadWMATIC();
      reloadShares();
    }, 2000);
    return () => clearInterval(interval);
  }, [reloadETH, reloadWMATIC, reloadShares]);

  return (
    <BalanceContext.Provider
      value={{
        matic,
        wMatic,
        shares,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalances = (): {
  matic: BigNumber;
  wMatic: BigNumber;
  shares: BigNumber;
} => {
  const { matic, wMatic, shares } = useContext(BalanceContext);
  return { matic, wMatic, shares };
};
