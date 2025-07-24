import { useMemo } from "react";
import type { Network } from "../../types";

export interface StatusDisplayProps {
  error: string;
  txSignature: string;
  network: Network;
}

interface UseStatusDisplayReturn {
  explorerUrl?: string;
  status: "error" | "success" | "idle";
};

const SOLANA_EXPLORER_BASE_URLS: Record<string, string> = {
  devnet: "https://explorer.solana.com/tx/",
  testnet: "https://explorer.solana.com/tx/",
  "mainnet-beta": "https://explorer.solana.com/tx/",
};

function useStatusDisplay({
  error,
  txSignature,
  network,
}: StatusDisplayProps): UseStatusDisplayReturn {
  // Compute the explorer URL for the transaction signature
  const explorerUrl = useMemo(() => {
    if (!txSignature) return;

    const baseUrl =
      SOLANA_EXPLORER_BASE_URLS[network] ?? SOLANA_EXPLORER_BASE_URLS["devnet"];
    const clusterParam =
      network === "mainnet-beta" ? "" : `?cluster=${network}`;

    return `${baseUrl}${txSignature}${clusterParam}`;
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
};

export default useStatusDisplay;
