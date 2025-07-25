import { lazy, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

// Import custom components
import WalletConnect from "./components/WalletConnect/WalletConnect";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import MemoFeed from "./components/MemoFeed/MemoFeed";

// Constants
import { SOLANA_NETWORK } from "./constants";

// Styles
import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

const SolanaProvider = lazy(
  () => import("./components/SolanaProvider/SolanaProvider")
);
const MemoForm = lazy(() => import("./components/MemoForm/MemoForm"));

function App() {
  const network = useMemo(() => {
    switch (SOLANA_NETWORK) {
      case "mainnet-beta":
        return WalletAdapterNetwork.Mainnet;
      case "testnet":
        return WalletAdapterNetwork.Testnet;
      default:
        return WalletAdapterNetwork.Devnet;
    }
  }, []);

  return (
    <ErrorBoundary>
      <SolanaProvider>
        <WalletConnect />
        <MemoForm network={network} />
        <MemoFeed />
      </SolanaProvider>
    </ErrorBoundary>
  );
}

export default App;
