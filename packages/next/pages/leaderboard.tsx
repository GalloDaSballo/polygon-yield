import { BigNumber } from "@ethersproject/bignumber";
import { useState } from "react";
import useLeaderboard from "../hooks/useLeaderboard";
import styles from "../styles/Home.module.scss";
import { formatMatic } from "../utils/format";

const LeaderboardPage: React.FC = () => {
  const [orderBy, setOrderBy] = useState<"shares" | "earned" | "deposited">(
    "shares"
  );
  const [orderDirection, setOrderDirection] = useState<"desc" | "asc">("desc");
  const leaderBoard = useLeaderboard(orderBy, orderDirection);
  console.log("leaderBoard", leaderBoard);

  const toggleOrderDirection = () => {
    return orderDirection === "desc"
      ? setOrderDirection("asc")
      : setOrderDirection("desc");
  };
  return (
    <div className={styles.container}>
      <div>
        <h2>Leaderboard</h2>
      </div>
      <div className={styles.table}>
        <div>
          <div
            onClick={() =>
              orderBy === "shares"
                ? toggleOrderDirection()
                : setOrderBy("shares")
            }
          >
            Shares
          </div>
          <div
            onClick={() =>
              orderBy === "deposited"
                ? toggleOrderDirection()
                : setOrderBy("deposited")
            }
          >
            Deposited
          </div>
          <div
            onClick={() =>
              orderBy === "earned"
                ? toggleOrderDirection()
                : setOrderBy("earned")
            }
          >
            Earned
          </div>
        </div>
        {leaderBoard.map((account) => (
          <div>
            <div title={account.shares}>{formatMatic(account.shares)}</div>
            <div title={account.deposited}>
              {formatMatic(account.deposited)}
            </div>
            <div title={account.earned}>{formatMatic(account.earned)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default LeaderboardPage;
