import Head from "next/head";
import APR from "../components/APR";
import UnwrapMatic from "../components/UnwrapMatic";
import WrapMatic from "../components/WrapMatic";
import styles from "../styles/Home.module.scss";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WrapMatic />
      <UnwrapMatic />
      <APR address="0x1a13F4Ca1d028320A707D99520AbFefca3998b7F" />
    </div>
  );
};

export default Home;
