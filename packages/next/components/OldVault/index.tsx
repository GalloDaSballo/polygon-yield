/**
 * Old Vault is the wMatic vault from archival-v1.5
 * It uses the /old.tsx components
 * May need to maintain it for a while as I don't plan on extending the wMatic Vault to have any other strategy beside farming AAVE Rewards
 */
import { useState } from "react";
import styles from "../Vault/Vault.module.scss";
import DepositOld from "../Deposit/old";
import WithdrawOld from "../Withdraw/old";
import StatsOld from "../Stats/old";

const OldVault: React.FC = () => {
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className={styles.vault}>
      <div className={styles.body}>
        <div
          className={styles.click}
          onClick={() => setShowDeposit(!showDeposit)}
        >
          <StatsOld arrowDown={!showDeposit} />
        </div>
        {showDeposit && (
          <div className={styles.actions}>
            <div>
              <DepositOld />
            </div>
            <div>
              <WithdrawOld />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OldVault;
