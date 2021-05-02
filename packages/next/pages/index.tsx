import Head from "next/head";
import UnwrapMatic from "../components/UnwrapMatic";
import WrapMatic from "../components/WrapMatic";
import Deposit from "../components/Deposit";
import styles from "../styles/Home.module.scss";
import Withdraw from "../components/Withdraw";
import Stats from "../components/Stats";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <Stats />
        </div>
        <div>
          <WrapMatic />
          <UnwrapMatic />
          <Deposit />
          <Withdraw />
        </div>
      </div>
    </div>
  );
};

export default Home;
