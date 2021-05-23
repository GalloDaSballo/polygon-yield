import { utils } from "ethers";
import { useState } from "react";
import useVaultLeaderboard from "../../hooks/useVaultLeaderboard";
import styles from "../../styles/Home.module.scss";
import { Vault } from "../../types";
import { formatMatic } from "../../utils/format";

const showArrow = (
  name: string,
  active: string,
  direction: string
): JSX.Element => {
  if (name !== active) {
    return null;
  }

  return (
    <img
      alt={`Sort By ${direction}`}
      src="/images/arrow-up.svg"
      className={`${styles.arrow} ${direction === "desc" ? styles.down : ""}`}
    />
  );
};

const VaultLeaderboard: React.FC<{vault: Vault}> = ({vault}) => {
  const [orderBy, setOrderBy] = useState<"shares" | "earned" | "deposited">(
    "shares"
  );
  const [orderDirection, setOrderDirection] = useState<"desc" | "asc">("desc");
  const leaderBoard = useVaultLeaderboard(vault.address.toLowerCase(), orderBy, orderDirection);
  console.log("leaderBoard", leaderBoard);

  const toggleOrderDirection = () => {
    return orderDirection === "desc"
      ? setOrderDirection("asc")
      : setOrderDirection("desc");
  };
  return (
    <div className={styles.container}>
      <div>
        <h2>Stats for {vault.name}</h2>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <div>Address</div>
          <div
            onClick={() =>
              orderBy === "shares"
                ? toggleOrderDirection()
                : setOrderBy("shares")
            }
            className={orderBy === "shares" ? styles.active : null}
          >
            Shares
            {showArrow("shares", orderBy, orderDirection)}
          </div>
          <div
            onClick={() =>
              orderBy === "deposited"
                ? toggleOrderDirection()
                : setOrderBy("deposited")
            }
            className={orderBy === "deposited" ? styles.active : null}
          >
            Deposited
            {showArrow("deposited", orderBy, orderDirection)}
          </div>
          <div
            onClick={() =>
              orderBy === "earned"
                ? toggleOrderDirection()
                : setOrderBy("earned")
            }
            className={orderBy === "earned" ? styles.active : null}
          >
            Earned
            {showArrow("earned", orderBy, orderDirection)}
          </div>
        </div>
        {leaderBoard.map((account) => (
          <div>
            <div>{account.account.id.substring(0, 8)}</div>
            <div title={account.shares}>{utils.formatUnits(account.shares, vault.decimals)}</div>
            <div title={account.deposited}>
              {utils.formatUnits(account.deposited, vault.decimals)}
            </div>
            <div title={account.earned}>{utils.formatUnits(account.earned, vault.decimals)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default VaultLeaderboard;
