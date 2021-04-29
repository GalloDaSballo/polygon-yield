import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import { Provider, Web3Provider } from "@ethersproject/providers";
import { UserContextProvider } from "../context/UserContext";
import { BalanceContextProvider } from "../context/BalanceContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const getLibrary = (provider: Provider): Web3Provider => {
  return new Web3Provider(provider as any); // this will vary according to whether you use e.g. ethers or web3.js
};

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <UserContextProvider>
        <BalanceContextProvider>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </BalanceContextProvider>
      </UserContextProvider>
    </Web3ReactProvider>
  );
};

export default MyApp;
