import { utils, Contract, BigNumber } from "ethers";
import { FormEvent, useMemo, useState } from "react";
import { useBalances } from "../../context/BalanceContext";
import { useUser } from "../../context/UserContext";
import {
  WMATIC_ADDR,
  WMATIC_ABI,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "../../utils/constants";

const Deposit: React.FC = () => {
  const user = useUser();
  const { wMatic: wMaticBalance } = useBalances();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const BNAmount = useMemo(
    () => (amount ? utils.parseUnits(amount, "ether") : BigNumber.from("0")),
    [amount]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const wMatic = new Contract(
      WMATIC_ADDR,
      WMATIC_ABI,
      user.provider.getSigner()
    );
    const allowance = await wMatic.allowance(user.address, CONTRACT_ADDRESS);
    console.log("allowance", allowance.toString());
    if (allowance.lt(BNAmount)) {
      // Require allowance
      setLoading(true);
      const allowanceRequest = await wMatic.approve(CONTRACT_ADDRESS, BNAmount);
      await allowanceRequest.wait();
      setLoading(false);
    }

    const vault = new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      user.provider.getSigner()
    );

    const depositRequest = await vault.deposit(BNAmount, {gasLimit: 1000000});
    setLoading(true);
    const result = await depositRequest.wait();
    setLoading(false);
    console.log("result", result);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3>Deposit</h3>
      {loading && <p>LOADING</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.0001"
          min="0"
          max={wMaticBalance ? utils.formatEther(wMaticBalance) : "0"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Deposit</button>
      </form>
    </div>
  );
};

export default Deposit;
