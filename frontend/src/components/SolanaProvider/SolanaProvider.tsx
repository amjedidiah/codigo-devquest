import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { PropsWithChildren } from "react";
import { SOLANA_RPC_ENDPOINT } from "../../constants";
import type { Adapter } from "@solana/wallet-adapter-base";

const wallets = [] as Adapter[];

function SolanaProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
