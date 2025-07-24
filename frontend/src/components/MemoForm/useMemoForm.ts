import {
  useState,
  useCallback,
  type ChangeEventHandler,
  type FormEvent,
  useRef,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { MEMO_PROGRAM_ID } from "../../constants";
import consola from "consola";

interface UseMemoFormReturn {
  memoText: string;
  handleMemoTextChange: ChangeEventHandler<HTMLTextAreaElement>;
  isLoading: boolean;
  error: string;
  txSignature: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
}

// Extracted hook for transaction execution
const useTransactionExecution = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const executeTransaction = useCallback(
    async (memoText: string) => {
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      // Build transaction
      const tx = new web3.Transaction();

      // Memo instruction
      const memoIx = new web3.TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
        programId: MEMO_PROGRAM_ID,
        data: new TextEncoder().encode(memoText) as unknown as Buffer,
      });
      tx.add(memoIx);

      // Get blockhash and lastValidBlockHeight from the same call
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = wallet.publicKey;

      // Send transaction
      const signature = await wallet.sendTransaction(tx, connection);

      // Wait for confirmation using the same blockhash and lastValidBlockHeight
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    },
    [connection, wallet]
  );

  return { executeTransaction };
};

function useMemoForm(): UseMemoFormReturn {
  const [memoText, setMemoText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [error, setError] = useState("");

  // Using refs to avoid stale closures in async operations
  const memoTextRef = useRef(memoText);
  memoTextRef.current = memoText;

  const isSubmittingRef = useRef(false);

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

      if (isSubmittingRef.current) return;

      setError("");
      setTxSignature("");

      try {
        const currentMemoText = memoTextRef.current.trim();
        if (!currentMemoText) throw new Error("Memo is required");

        isSubmittingRef.current = true; // Set the lock
        setIsLoading(true);

        const signature = await executeTransaction(currentMemoText);
        setTxSignature(signature);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transaction failed");
        consola.error("Transaction error:", err);
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false; // Release the lock
      }
    },
    [executeTransaction]
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
