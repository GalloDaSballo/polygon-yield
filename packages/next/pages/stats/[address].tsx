import { useRouter } from "next/dist/client/router";
import useAccount from "../../hooks/useAccount";
import { formatMatic } from "../../utils/format";
import styles from "../../styles/Home.module.scss";

const SingleAddressStatPage: React.FC = () => {
  const router = useRouter();
  const { address } = router.query;
  const data = useAccount(String(address));

  if (!data) {
    return <p>Loading or Not Found</p>;
  }
  return (
    <div className={styles.container}>
      <h2>Stats for {address}</h2>
      <div>
        <h3>Shares</h3>
        <p>{formatMatic(data.shares)}</p>
      </div>
      <div>
        <h3>Deposited</h3>
        <p>{formatMatic(data.deposited)}</p>
      </div>
      <div>
        <h3>Earned</h3>
        <p>{formatMatic(data.earned)}</p>
      </div>
    </div>
  );
};

export default SingleAddressStatPage;
