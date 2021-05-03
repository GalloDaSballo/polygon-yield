import { Contract } from "@ethersproject/contracts";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../utils/constants";

const ReinvestRewards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const reinvest = async () => {
    const vault = new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      user.provider.getSigner()
    );

    const tx = await vault.reinvestRewards({ gasLimit: 6000000 });
    setLoading(true);
    await tx.wait();
    setLoading(false);
  };

  return (
    <div>
      <h2>Claim rewards and reinvest</h2>
      <p>
        Anyone can call this, it will harvest AAVEs rewards and reinvest them
      </p>
      <button type="button" onClick={reinvest}>
        {loading ? "Loading" : "ReinvestRewards"}
      </button>
    </div>
  );
};

export default ReinvestRewards;
