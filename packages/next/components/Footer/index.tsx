import styles from "./Footer.module.scss";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <div>
          <a
            href="mailto:alex@entreprenerd.xyz"
            target="_blank"
            rel="nofollow noreferrer"
          >
            Investor? Let's talk
          </a>
        </div>
        <div>
          <a
            href="https://www.notion.so/Myield-Earn-Matic-with-your-Matic-257288aff5b74be9b37728c6b7d28a28"
            target="_blank"
            rel="nofollow noreferrer"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
