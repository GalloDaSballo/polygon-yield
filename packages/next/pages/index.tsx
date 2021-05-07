import Head from "next/head";
import { useState } from "react";
import UnwrapMatic from "../components/UnwrapMatic";
import WrapMatic from "../components/WrapMatic";
import Deposit from "../components/Deposit";
import styles from "../styles/Home.module.scss";
import Withdraw from "../components/Withdraw";
import Stats from "../components/Stats";
import GraphStats from "../components/GraphStats";
import { useUser } from "../context/UserContext";
import HowItWorks from "../components/HowItWorks";
import Tech from "../components/Tech";

enum Tabs {
  vault = 0,
  wmatic,
}

const Home: React.FC = () => {
  const [tab, setTab] = useState<Tabs>(Tabs.vault);
  const user = useUser();

  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Matic with your Matic</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.masthead}>
        <h1>Earn more Matic, with your Matic</h1>
        <p>⚠️Code unadited⚠️</p>
        <p>
          Myield manages your Matic on AAVE to earn the highest amount of
          Polygon rewards
        </p>
      </div>
      <div>
        <Tech />
      </div>
      <div>
        <GraphStats />
      </div>

      {user && (
        <div className={styles.tabs}>
          <button
            className={tab === Tabs.vault ? styles.active : null}
            type="button"
            onClick={() => setTab(Tabs.vault)}
          >
            Deposit / Withdraw
          </button>
          <button
            className={tab === Tabs.wmatic ? styles.active : null}
            type="button"
            onClick={() => setTab(Tabs.wmatic)}
          >
            Wrap / Unwrap
          </button>
        </div>
      )}

      <div className={styles.main}>
        <div className={styles.stats}>
          <Stats />
        </div>

        {/* Actions */}
        {tab === Tabs.wmatic && (
          <div className={styles.action}>
            <WrapMatic />
            <UnwrapMatic />
          </div>
        )}

        {tab === Tabs.vault && (
          <div className={styles.action}>
            <Deposit />
            <Withdraw />
          </div>
        )}
      </div>
      <HowItWorks />
    </div>
  );
};

export default Home;
