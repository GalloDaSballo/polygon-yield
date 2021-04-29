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
      </div>
    </footer>
  );
};

export default Footer;
