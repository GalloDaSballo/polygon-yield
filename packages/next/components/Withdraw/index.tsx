import { utils, Contract, BigNumber } from "ethers";
import { FormEvent, useMemo, useState } from "react";
import { useBalances } from "../../context/BalanceContext";
import { useUser } from "../../context/UserContext";
import { VAULT_ABI } from "../../utils/vaults";
import { formatMatic } from "../../utils/format";
import styles from "../../styles/widget.module.scss";
import { Vault } from "../../types";
import useERC20Balance from "../../hooks/useERC20Balance";

const Withdraw: React.FC<{ vault: Vault }> = ({ vault }) => {
  const user = useUser();
  const vaultBalance = useERC20Balance(user, vault.address);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const BNAmount = useMemo(
    () =>
      amount ? utils.parseUnits(amount, vault.decimals) : BigNumber.from("0"),
    [amount, vault]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const vaultContract = new Contract(
      vault.address,
      VAULT_ABI,
      user.provider.getSigner()
    );

    const withdrawRequest = await vaultContract.withdraw(BNAmount, {
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
          onClick={() =>
            setAmount(utils.formatUnits(vaultBalance, vault.decimals))
          }
        >
          Shares Balance: {utils.formatUnits(vaultBalance, vault.decimals)}
        </button>
      </h3>
      {loading && <p>LOADING</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.000000000000000001"
          min="0"
          max={
            vaultBalance ? utils.formatUnits(vaultBalance, vault.decimals) : "0"
          }
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
