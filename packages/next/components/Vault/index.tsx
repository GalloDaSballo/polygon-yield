import styles from "./Vault.module.scss";
import Stats from "../Stats";
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";

const Vault: React.FC<{ address: string; want: string }> = ({
  address,
  want,
}) => {
  return (
    <div className={styles.vault}>
      <div className={styles.header}>
        <div className={styles.headerEntry}>
          <img src="/" alt={want} />
          <h3>{want}</h3>
        </div>
        <div>
          <h3>Total Deposited</h3>
        </div>
      </div>
      <div className={styles.body}>
        <Stats address={address} want={want} />
        <div>
          <Deposit address={address} want={want} />
          <Withdraw address={address} want={want} />
        </div>
      </div>
    </div>
  );
};

export default Vault;
