import Link from "next/link";
import { useWeb3React } from "@web3-react/core";
import { utils } from "ethers";
import { useLogin, useUser } from "../../context/UserContext";
import handleConnetionError from "../../utils/handleConnectionError";
import styles from "./Header.module.scss";
import { useBalances } from "../../context/BalanceContext";
import { formatStringAmount } from "../../utils/format";

const Header: React.FC = () => {
  const user = useUser();
  const { error } = useWeb3React();

  const { matic, wMatic, shares } = useBalances();

  const login = useLogin();
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <img className={styles.logo} src="/images/logo.png" alt="Myield" />
        </a>
      </Link>
      {error && <span>{handleConnetionError(error)}</span>}
      <div>
        <Link href="/wbtc">
          <a className={styles.link}>Earn wBTC</a>
        </Link>
        {user && (
          <span className={styles.commands}>
            <span className={styles.accountName}>
              Connected as: {String(user?.address).substring(0, 6)}...
            </span>
            {/* <Link href={`/stats/${user?.address}`}>
              <a>View your Stats</a>
            </Link> */}
            <span className={styles.userDetails} />
          </span>
        )}
        {!user && (
          <button
            type="button"
            onClick={() => login()}
            className={styles.button}
          >
            Login with Metamask
          </button>
        )}
      </div>
    </header>
  );
};
export default Header;
