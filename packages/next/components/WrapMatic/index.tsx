import { utils, Contract } from "ethers";
import { FormEvent, useMemo, useState } from "react";
import { useUser } from "../../context/UserContext";
import { WMATIC_ADDR, WMATIC_ABI } from "../../utils/constants";

const WrapMatic: React.FC = () => {
  const user = useUser();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const BNAmount = useMemo(() => utils.parseUnits(amount, "ether"), [amount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const wMatic = new Contract(
      WMATIC_ADDR,
      WMATIC_ABI,
      user.provider.getSigner()
    );
    const tx = await wMatic.deposit({ value: BNAmount });
    setLoading(true);
    await tx.wait();
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3>Wrap Matic</h3>
      {loading && <p>LOADING</p>}
      <form onSubmit={handleSubmit}>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button type="submit">Wrap</button>
      </form>
    </div>
  );
};

export default WrapMatic;
