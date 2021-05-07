import Link from "next/link";
import useProtocolStats from "../../hooks/useProtocolStats";
import { formatMatic } from "../../utils/format";
import styles from "./GraphStats.module.scss";

const GraphStats: React.FC = () => {
  const stats = useProtocolStats("v1");
  console.log("stats", stats);
  if (!stats) {
    return null;
  }
  return (
    <div className={styles.container}>
      <main>
        {/* <div>
          <h3>Users</h3>
          {stats.lifetimeUsers}
        </div> */}
        <div>
          <h3>Lifetime TVL</h3>
          {formatMatic(stats.lifetimeDeposited)}
        </div>
        <div>
          <h3>Lifetime Earned</h3>
          {formatMatic(stats.lifetimeHarvested)}
        </div>
        {/* <div>
          <h3>Treasury Earned</h3>
          {formatMatic(stats.lifetimeTreasury)}
        </div> */}
      </main>
      <div className={styles.links}>
        <Link href="/leaderboard">
          <a>Leaderboard</a>
        </Link>
      </div>
    </div>
  );
};

export default GraphStats;
