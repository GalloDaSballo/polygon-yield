import { utils, Contract, BigNumber } from "ethers";
import { FormEvent, useMemo, useState } from "react";
import { useBalances } from "../../context/BalanceContext";
import { useUser } from "../../context/UserContext";
import { WMATIC_ABI } from "../../utils/constants";
import { VAULT_ABI } from "../../utils/vaults";
import { formatMatic } from "../../utils/format";
import styles from "../../styles/widget.module.scss";
import { Vault } from "../../types";
import useERC20Balance from "../../hooks/useERC20Balance";

const Deposit: React.FC<{ vault: Vault }> = ({ vault }) => {
  const user = useUser();
  const wantBalance = useERC20Balance(user, vault.want.address);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const BNAmount = useMemo(
    () =>
      amount
        ? utils.parseUnits(amount, vault.want.decimals)
        : BigNumber.from("0"),
    [amount, vault]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const wantContract = new Contract(
      vault.want.address,
      WMATIC_ABI,
      user.provider.getSigner()
    );
    const allowance = await wantContract.allowance(user.address, vault.address);
    console.log("allowance", allowance.toString());
    if (allowance.lt(BNAmount)) {
      // Require allowance
      setLoading(true);
      const allowanceRequest = await wantContract.approve(
        vault.address,
        BNAmount
      );
      await allowanceRequest.wait();
      setLoading(false);
    }

    const vaultContract = new Contract(
      vault.address,
      VAULT_ABI,
      user.provider.getSigner()
    );

    const depositRequest = await vaultContract.deposit(BNAmount, {
      gasLimit: 1000000,
    });
    setLoading(true);
    const result = await depositRequest.wait();
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h3 className={styles.title}>
        Deposit {vault.want.symbol}{" "}
        <button
          type="submit"
          onClick={() =>
            setAmount(utils.formatUnits(wantBalance, vault.want.decimals))
          }
        >
          Balance: {utils.formatUnits(wantBalance, vault.want.decimals)}
        </button>
      </h3>
      {loading && <p>LOADING</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.000000000000000001"
          min="0"
          max={
            wantBalance
              ? utils.formatUnits(wantBalance, vault.want.decimals)
              : "0"
          }
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button disabled={!amount} type="submit">
          Deposit
        </button>
      </form>
    </div>
  );
};

export default Deposit;
