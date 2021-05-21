import styles from "./Vault.module.scss";
import Stats from "../Stats";
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";
import { Vault } from "../../types";

const VaultComponent: React.FC<{ vault: Vault }> = ({ vault }) => {
  return (
    <div className={styles.vault}>
      <div className={styles.header}>
        <div className={styles.headerEntry}>
          <img src={vault.logoURI} alt={vault.name} />
          <h3>{vault.name}</h3>
        </div>
        <div>
          <h3>Total Deposited</h3>
        </div>
      </div>
      <div className={styles.body}>
        <Stats vault={vault} />
        <div>
          <Deposit vault={vault} />
          <Withdraw vault={vault} />
        </div>
      </div>
    </div>
  );
};

export default VaultComponent;
