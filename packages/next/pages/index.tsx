import Head from "next/head";
import styles from "../styles/Home.module.scss";
import GraphStats from "../components/GraphStats";
import HowItWorks from "../components/HowItWorks";
import Tech from "../components/Tech";
import vaults from "../utils/vaults";
import Vault from "../components/Vault";
import OldVault from "../components/OldVault";
import VaultLeaderboard from "../components/VaultLeaderboard";
import Features from "../components/Features";
import Leaderboard from "../components/Leaderboard";

const NewHome: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Matic with your Matic</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.blue}>
        <img className={styles.topLeft} alt="bg" src="/images/top-left.png" />
        <img
          className={styles.bottomRight}
          alt="bg"
          src="/images/bottom-right.png"
        />
        <div className={styles.masthead}>
          <h1>Earn more Rewards, with your Tokens</h1>
          <p>⚠️Code unadited⚠️</p>
          <p>
            Myield manages your Tokens on AAVE to earn the highest amount of
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
        <div>
            {vaults.map((vault) => (
              <VaultLeaderboard vault={vault} />
            ))}
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
