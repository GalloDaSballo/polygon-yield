import styles from "./Tech.module.scss";

const Tech: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Technologies Used</h2>
      <div className={styles.tech}>
        <div>
          <h3>Polygon</h3>
          <img src="/images/polygon.png" alt="Polygon" />
        </div>
        <div>
          <h3>AAVE</h3>
          <img src="/images/AAVE.jpeg" alt="AAVE" />
        </div>
        <div>
          <h3>The Graph</h3>
          <img src="/images/thegraph.png" alt="The Graph" />
        </div>
      </div>
    </div>
  );
};

export default Tech;
