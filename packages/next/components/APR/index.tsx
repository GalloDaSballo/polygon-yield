import { useCallback, useEffect, useState } from "react";
import getAPR from "../../utils/getAPR";

const useApr = (assetAddress: string): string => {
  const [apr, setApr] = useState("0");

  const updateApr = useCallback(async () => {
    const res = await getAPR(assetAddress);
    setApr(res);
  }, []);

  // Reload balances and allowance every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateApr();
    }, 2000);
    return () => clearInterval(interval);
  }, [updateApr]);
  return apr;
};
const APR: React.FC<{ address: string }> = ({ address }) => {
  const apr = useApr(address);
  return <div>{apr}</div>;
};

export default APR;
