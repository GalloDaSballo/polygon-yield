import { Contract } from "@ethersproject/contracts";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../utils/constants";

const Rebalance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const rebalance = async () => {
    const vault = new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      user.provider.getSigner()
    );

    const tx = await vault.rebalance({ gasLimit: 5000000 });
    setLoading(true);
    await tx.wait();
    setLoading(false);
  };

  return (
    <div>
      <h2>Rebalance (goes to 1.3 health factor)</h2>
      <button type="button" onClick={rebalance}>
        {loading ? "Loading" : "Rebalance"}
      </button>
    </div>
  );
};

export default Rebalance;
