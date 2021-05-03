import Head from "next/head";
import { useState } from "react";
import UnwrapMatic from "../components/UnwrapMatic";
import WrapMatic from "../components/WrapMatic";
import Deposit from "../components/Deposit";
import styles from "../styles/Home.module.scss";
import Withdraw from "../components/Withdraw";
import Stats from "../components/Stats";
import ReinvestRewards from "../components/ReinvestRewards";

enum Tabs {
  vault = 0,
  wmatic,
  admin,
}

const Home: React.FC = () => {
  const [tab, setTab] = useState<Tabs>(Tabs.vault);

  return (
    <div className={styles.container}>
      <Head>
        <title>Myield - Earn Matic with your Matic</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <button type="button" onClick={() => setTab(Tabs.vault)}>
          Deposit / Withdraw
        </button>
        <button type="button" onClick={() => setTab(Tabs.wmatic)}>
          Wrap / Unwrap
        </button>
        <button type="button" onClick={() => setTab(Tabs.admin)}>
          Admin
        </button>
      </div>

      <div className={styles.main}>
        <div>
          <Stats />
        </div>

        {tab === Tabs.wmatic && (
          <div>
            <WrapMatic />
            <UnwrapMatic />
          </div>
        )}

        {tab === Tabs.vault && (
          <div>
            <Deposit />
            <Withdraw />
          </div>
        )}

        {tab === Tabs.admin && (
          <div>
            <ReinvestRewards />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
