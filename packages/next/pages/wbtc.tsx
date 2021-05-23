import Head from "next/head";
import styles from "../styles/Home.module.scss";
import GraphStats from "../components/GraphStats";
import HowItWorks from "../components/HowItWorks";
import Tech from "../components/Tech";
import DCAVault from "../components/DCAVault";
import Leaderboard from "../components/Leaderboard";
import Features from "../components/Features";
import dcaVaults from "../utils/dcaVaults";
import VaultLeaderboard from "../components/VaultLeaderboard";

const NewHome: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Bitcoin with your USDC</title>
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
          <h1>Earn more wBTC, with your USDC</h1>
          <p>⚠️Code unadited⚠️</p>
          <p>
            Myield manages your Tokens on AAVE to earn the highest amount of
            Polygon rewards
          </p>
          <p>
            These are special, Dollar Cost Averaging Vaults, which will earn
            wBTC with a deposit of USDC
          </p>
          <p>wBTC is sent directly to your address every few minutes</p>
        </div>
        <div>
          <GraphStats />
        </div>

        <div className={styles.vaults}>
          {dcaVaults.map((vault) => (
            <DCAVault vault={vault} />
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <div>
        {dcaVaults.map((vault) => (
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
