import { PublicKey, clusterApiUrl, type Cluster } from "@solana/web3.js";

// The Program ID of the SPL Memo program.
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// The Program ID of the Anchor SPL Memo program.
export const ANCHOR_SPL_MEMO_PROGRAM_ID = new PublicKey(
  "2p1eq5RNKv4MrESEPtA9za96diQnRHxLd48gz33Yq7r4"
);

// The default Solana network.
export const DEFAULT_NETWORK: Cluster = "devnet";

// The Solana network to use.
export const SOLANA_NETWORK =
  (import.meta.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) ?? DEFAULT_NETWORK;

// The Solana RPC endpoint.
export const SOLANA_RPC_ENDPOINT =
  import.meta.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ??
  clusterApiUrl(SOLANA_NETWORK);

// The base URL for the Solana Explorer.
export const SOLANA_EXPLORER_BASE_URL = "https://explorer.solana.com";
