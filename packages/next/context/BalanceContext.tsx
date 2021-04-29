import { BigNumber } from "ethers";
import { createContext, useEffect, useContext } from "react";
import useETHBalance from "../hooks/useETHBalance";
import useWMATICBalance from "../hooks/useWMATICBalance";
import { useUser } from "./UserContext";

type BalanceContextData = {
  matic: BigNumber | null;
  wMatic: BigNumber | null;
};

const BalanceContext = createContext<BalanceContextData>({
  matic: null,
  wMatic: null,
});
export default BalanceContext;

export const BalanceContextProvider: React.FC = ({ children }) => {
  const user = useUser();
  const [matic, reloadETH] = useETHBalance(user);
  const [wMatic, reloadWMATIC] = useWMATICBalance(user);

  // Reload balances and allowance every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      reloadETH();
      reloadWMATIC();
    }, 2000);
    return () => clearInterval(interval);
  }, [reloadETH, reloadWMATIC]);

  return (
    <BalanceContext.Provider
      value={{
        matic,
        wMatic,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalances = () => {
  const { matic, wMatic } = useContext(BalanceContext);
  return { matic, wMatic };
};
