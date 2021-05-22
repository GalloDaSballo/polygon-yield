import styles from "./Features.module.scss";

/** List of feats for convenience */
const features = [
  {
    img: "/images/logo.png",
    text:
      "Myield automates borrowing and lending, simply deposit and the smart contract will manage your MATIC for you!",
  },
  {
    img: "/images/logo.png",
    text:
      "Myield takes a 5% performance fee on Harvest, this is applied exclusively to the rewards earned, your principal is never touched",
  },
];

/** Single Feature Component */
const Feature: React.FC<{ text: string; img: string }> = ({ text, img }) => (
  <div className={styles.feature}>
    <img alt={text} src={img} />
    <h3>{text}</h3>
  </div>
);

/** Feature List, exported from this file */
const Features: React.FC = () => {
  return (
    <div>
      {features.map(({ text, img }) => (
        <Feature img={img} text={text} />
      ))}
    </div>
  );
};

export default Features;
