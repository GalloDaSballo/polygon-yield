import Link from "next/link";
import { useWeb3React } from "@web3-react/core";
import { utils } from "ethers";
import { useLogin, useUser } from "../../context/UserContext";
import handleConnetionError from "../../utils/handleConnectionError";
import styles from "./Header.module.scss";
import { useBalances } from "../../context/BalanceContext";

const Header: React.FC = () => {
  const user = useUser();
  const { error } = useWeb3React();

  const { matic, wMatic } = useBalances();

  const login = useLogin();
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>MyYield</a>
      </Link>
      {error && <span>{handleConnetionError(error)}</span>}
      {user && (
        <div>
          <div className={styles.commands}>
            Connected as: {String(user?.address).substring(0, 6)}... Matic:{" "}
            {utils.formatEther(matic.toString())}
            Wmatic: {utils.formatEther(wMatic.toString())}
          </div>
        </div>
      )}
      {!user && (
        <button type="button" onClick={() => login()} className={styles.button}>
          Login with Metamask
        </button>
      )}
    </header>
  );
};
export default Header;
