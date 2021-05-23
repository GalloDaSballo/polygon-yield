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
          <p>{stats.lifetimeUsers}</p>
        </div> */}
        <div>
          <h3>Lifetime TVL</h3>
          <p>{formatMatic(stats.lifetimeDeposited)}</p>
        </div>
        <div>
          <h3>Lifetime Earned</h3>
          <p>{formatMatic(stats.lifetimeHarvested)}</p>
        </div>
        {/* <div>
          <h3>Treasury Earned</h3>
          <p>{formatMatic(stats.lifetimeTreasury)}</p>
        </div> */}
      </main>
    </div>
  );
};

export default GraphStats;
