import { PublicKey, clusterApiUrl, type Cluster } from "@solana/web3.js";

// The Program ID of the SPL Memo program.
export const MEMO_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_MEMO_PROGRAM_ID
);

// The on-chain ID of your deployed Anchor program.
export const ANCHOR_SPL_MEMO_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_ANCHOR_SPL_MEMO_PROGRAM_ID
);

// The Solana network to use.
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK as Cluster;

// The Solana RPC endpoint.
export const SOLANA_RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC_ENDPOINT ?? clusterApiUrl(SOLANA_NETWORK);

// The base URL for the Solana Explorer.
export const SOLANA_EXPLORER_BASE_URL = "https://explorer.solana.com";
