import type { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo } from "react";
import { SOLANA_EXPLORER_BASE_URL } from "../../constants";

export interface StatusDisplayProps {
  error: string;
  txSignature: string;
  network: WalletAdapterNetwork;
}

interface UseStatusDisplayReturn {
  explorerUrl?: string;
  status: "error" | "success" | "idle";
}

function useStatusDisplay({
  error,
  txSignature,
  network,
}: StatusDisplayProps): UseStatusDisplayReturn {
  // Compute the explorer URL for the transaction signature
  const explorerUrl = useMemo(() => {
    if (!txSignature) return;

    const clusterParam =
      network === "mainnet-beta" ? "" : `?cluster=${network}`;

    return `${SOLANA_EXPLORER_BASE_URL}/tx/${txSignature}${clusterParam}`;
  }, [txSignature, network]);

  // Compute display state
  const status = useMemo(() => {
    if (error) return "error";
    if (txSignature) return "success";
    return "idle";
  }, [error, txSignature]);

  return {
    explorerUrl,
    status,
  };
}

export default useStatusDisplay;
