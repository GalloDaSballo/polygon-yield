import { utils, Contract, BigNumber } from "ethers";
import { FormEvent, useMemo, useState } from "react";
import { useBalances } from "../../context/BalanceContext";
import { useUser } from "../../context/UserContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../utils/constants";
import { formatMatic } from "../../utils/format";
import styles from "../../styles/widget.module.scss";

const Withdraw: React.FC = () => {
  const user = useUser();
  const { shares: sharesBalance } = useBalances();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const BNAmount = useMemo(
    () => (amount ? utils.parseUnits(amount, "ether") : BigNumber.from("0")),
    [amount]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const vault = new Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      user.provider.getSigner()
    );

    const withdrawRequest = await vault.withdraw(BNAmount, {
      gasLimit: 5000000,
    });
    setLoading(true);
    const result = await withdrawRequest.wait();
    setLoading(false);
    console.log("result", result);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3 className={styles.title}>
        Withdraw{" "}
        <button
          type="button"
          onClick={() => setAmount(utils.formatEther(sharesBalance))}
        >
          Shares Balance: {formatMatic(sharesBalance)}
        </button>
      </h3>
      {loading && <p>LOADING</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.000000000000000001"
          min="0"
          max={sharesBalance ? utils.formatEther(sharesBalance) : "0"}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button disabled={!amount} type="submit">
          Withdraw
        </button>
      </form>
    </div>
  );
};

export default Withdraw;
