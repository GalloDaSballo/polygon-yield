import { useState } from "react";
import styles from "./Vault.module.scss";
import Stats from "../Stats";
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";
import { Vault } from "../../types";

const VaultComponent: React.FC<{ vault: Vault }> = ({ vault }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  return (
    <div className={styles.vault}>
      <div className={styles.body}>
        <div
          className={styles.click}
          onClick={() => setShowDeposit(!showDeposit)}
        >
          <Stats vault={vault} arrowDown={!showDeposit} />
        </div>
        {showDeposit && (
          <div className={styles.actions}>
            <div>
              <Deposit vault={vault} />
            </div>
            <div>
              <Withdraw vault={vault} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultComponent;
