import {
  useState,
  useCallback,
  type ChangeEventHandler,
  type FormEvent,
  useRef,
  useMemo,
} from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import idl from "../../../../target/idl/anchor_spl_memo.json";

const MEMO_PROGRAM_ID = new web3.PublicKey(
  idl.instructions[0].accounts[1].address as string
);

interface AnchorWallet {
  publicKey: NonNullable<WalletContextState["publicKey"]>;
  signTransaction: NonNullable<WalletContextState["signTransaction"]>;
  signAllTransactions: NonNullable<WalletContextState["signAllTransactions"]>;
}

// Utility to adapt wallet-adapter wallet to Anchor's Wallet interface
const getAnchorWallet = (
  wallet: Pick<
    WalletContextState,
    "publicKey" | "signTransaction" | "signAllTransactions"
  >
) => {
  const requiredParams = [
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ];

  if (requiredParams.filter(Boolean).length === 3)
    return {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    } as AnchorWallet;

  return undefined;
};

// Extracted hook for wallet validation logic
const useWalletValidation = () => {
  const wallet = useWallet();

  const anchorWallet = useMemo(
    () =>
      getAnchorWallet({
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      }),
    [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]
  );

  const validateWallet = useCallback(() => {
    if (!wallet.connected || !wallet.publicKey) {
      return "Wallet not connected";
    }

    if (!anchorWallet) {
      return "Wallet does not support required signing methods";
    }

    return null;
  }, [wallet.connected, wallet.publicKey, anchorWallet]);

  return { wallet, anchorWallet, validateWallet };
};

// Extracted hook for transaction execution
const useTransactionExecution = () => {
  const { connection } = useConnection();

  const executeTransaction = useCallback(
    async (anchorWallet: AnchorWallet, memoText: string) => {
      // Build transaction
      const tx = new web3.Transaction();

      // Memo instruction
      const memoIx = new web3.TransactionInstruction({
        keys: [
          { pubkey: anchorWallet.publicKey, isSigner: true, isWritable: false },
        ],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoText, "utf-8"),
      });
      tx.add(memoIx);

      // Getting recent block hash for better transaction success rate
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = anchorWallet.publicKey;

      // Send transaction
      const signed = await anchorWallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight: (
            await connection.getLatestBlockhash()
          ).lastValidBlockHeight,
        },
        "confirmed"
      );

      return sig;
    },
    [connection]
  );

  return { executeTransaction };
};

interface UseMemoFormReturn {
  memoText: string;
  handleMemoTextChange: ChangeEventHandler<HTMLTextAreaElement>;
  isLoading: boolean;
  error: string;
  txSignature: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
}

function useMemoForm(): UseMemoFormReturn {
  const [memoText, setMemoText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");

  // Using refs to avoid stale closures in async operations
  const memoTextRef = useRef(memoText);
  memoTextRef.current = memoText;

  const { validateWallet, anchorWallet } = useWalletValidation();
  const { executeTransaction } = useTransactionExecution();

  const handleMemoTextChange: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (e) => {
        setMemoText(e.target.value);
        if (error) setError("");
      },
      [error]
    );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setError("");
      setTxSignature("");

      const walletError = validateWallet();
      if (walletError) {
        setError(walletError);
        return;
      }

      const currentMemoText = memoTextRef.current.trim();
      if (!currentMemoText) {
        setError("Memo is required");
        return;
      }

      setIsLoading(true);

      try {
        const signature = await executeTransaction(
          anchorWallet as unknown as AnchorWallet,
          currentMemoText
        );
        setTxSignature(signature);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transaction failed");
        console.error("Transaction error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [validateWallet, anchorWallet, executeTransaction]
  );

  const reset = useCallback(() => {
    setMemoText("");
    setTxSignature("");
    setError("");
    setIsLoading(false);
  }, []);

  return {
    memoText,
    handleMemoTextChange,
    isLoading,
    error,
    txSignature,
    handleSubmit,
    reset,
  };
}

export default useMemoForm;
