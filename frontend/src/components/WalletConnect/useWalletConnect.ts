import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

// Minimal hook returning wallet connection state for WalletConnect component
// Follows strict separation of concerns and type safety
interface UseWalletConnectReturn {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: string | null;
}

function useWalletConnect(): UseWalletConnectReturn {
  const { connected, connecting, disconnecting, publicKey } = useWallet();

  // Memoize the return value to prevent unnecessary re-renders
  // when the wallet object reference changes but values remain the same
  return useMemo(
    () => ({
      connected,
      connecting,
      disconnecting,
      publicKey: publicKey?.toBase58() ?? null,
    }),
    [connected, connecting, disconnecting, publicKey]
  );
}

export default useWalletConnect;
