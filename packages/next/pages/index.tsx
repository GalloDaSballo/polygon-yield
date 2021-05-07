import Head from "next/head";
import { useState } from "react";
import UnwrapMatic from "../components/UnwrapMatic";
import WrapMatic from "../components/WrapMatic";
import Deposit from "../components/Deposit";
import styles from "../styles/Home.module.scss";
import Withdraw from "../components/Withdraw";
import Stats from "../components/Stats";
import GraphStats from "../components/GraphStats";

enum Tabs {
  vault = 0,
  wmatic,
}

const Home: React.FC = () => {
  const [tab, setTab] = useState<Tabs>(Tabs.vault);

  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Matic with your Matic</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Earn more Matic, with your Matic</h1>
      <p>⚠️Code unadited⚠️</p>

      <GraphStats />

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

      <div className={styles.main}>
        <div>
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
    </div>
  );
};

export default Home;
