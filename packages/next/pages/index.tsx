import Head from "next/head";
import styles from "../styles/Home.module.scss";
import GraphStats from "../components/GraphStats";
import HowItWorks from "../components/HowItWorks";
import Tech from "../components/Tech";
import vaults from "../utils/vaults";
import Vault from "../components/Vault";
import OldVault from "../components/OldVault";
import Leaderboard from "../components/Leaderboard";
import Features from "../components/Features";

const NewHome: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Matic with your Matic</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.blue}>
        <div className={styles.masthead}>
          <h1>Earn more Matic, with your Matic</h1>
          <p>⚠️Code unadited⚠️</p>
          <p>
            Myield manages your Matic on AAVE to earn the highest amount of
            Polygon rewards
          </p>
        </div>
        <div>
          <GraphStats />
        </div>

        <div className={styles.vaults}>
          <OldVault />
          {vaults.map((vault) => (
            <Vault vault={vault} />
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <div>
          <Leaderboard />
        </div>
        <HowItWorks />
        <div>
          <Tech />
        </div>
        <div>
          <Features />
        </div>
      </div>
    </div>
  );
};

export default NewHome;
