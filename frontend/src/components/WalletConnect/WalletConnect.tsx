import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./wallet-connect.css";
import { memo } from "react";

/**
 * WalletConnect is a pure presentational component that renders the Solana wallet connection button.
 * All logic and state are managed by the wallet adapter context and custom hook.
 *
 * Accessibility: The container uses aria-label for selection and semantic clarity.
 */
const WalletConnect = memo(function WalletConnect() {
  return (
    <section aria-label="wallet connect">
      <WalletMultiButton />
    </section>
  );
});

export default WalletConnect;
