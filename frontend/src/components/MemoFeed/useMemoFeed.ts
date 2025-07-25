import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type {
  Connection,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo,
  ParsedInstruction,
  PartiallyDecodedInstruction,
} from "@solana/web3.js";
import { MEMO_PROGRAM_ID } from "../../constants";
import consola from "consola";

export interface Memo {
  id: string; // transaction signature
  content: string;
  timestamp: number;
}

/**
 * Fetches the full transaction details for a given list of signatures.
 * Includes a delay between requests to avoid hitting public RPC rate limits.
 */
async function fetchTransactionsForSignatures(
  connection: Connection,
  signatures: string[]
): Promise<(ParsedTransactionWithMeta | null)[]> {
  const transactions: (ParsedTransactionWithMeta | null)[] = [];

  for (const signature of signatures) {
    try {
      const transaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      transactions.push(transaction);
      await new Promise((resolve) => setTimeout(resolve, 400)); // Rate-limiting delay
    } catch (e) {
      consola.warn(`Failed to fetch transaction ${signature}`, e);
      transactions.push(null); // Keep order consistent
    }
  }
  return transactions;
}

/**
 * Extracts the memo content from a single transaction instruction.
 */
function extractMemoContentFromInstruction(
  instruction: ParsedInstruction | PartiallyDecodedInstruction
): string | undefined {
  if (!("parsed" in instruction)) return undefined;

  const parsedInfo = instruction.parsed;
  if (typeof parsedInfo === "string") return parsedInfo;

  if (parsedInfo && typeof parsedInfo.memo === "string") return parsedInfo.memo;

  return undefined;
}

/**
 * Parses memo content from a list of transactions.
 */
function parseMemosFromTransactions(
  transactions: (ParsedTransactionWithMeta | null)[],
  signatures: ConfirmedSignatureInfo[]
): Memo[] {
  return transactions
    .map((tx, i) => {
      if (!tx?.blockTime || tx?.meta?.err) return null;

      const memoInstruction = tx.transaction.message.instructions.find((ix) =>
        ix.programId.equals(MEMO_PROGRAM_ID)
      );

      if (!memoInstruction) return null;

      const memoContent = extractMemoContentFromInstruction(memoInstruction);

      if (memoContent)
        return {
          id: signatures[i].signature,
          content: memoContent,
          timestamp: tx.blockTime,
        };

      return null;
    })
    .filter((memo): memo is Memo => memo !== null);
}

const useMemoFeed = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [rawMemos, setRawMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(1);
  const memosPerPage = 10;

  const filteredMemos = useMemo(() => {
    return (
      rawMemos
        // Filter by searchTerm
        .filter((memo) => {
          const hasSearchTerm = memo.content
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return hasSearchTerm;
        })
        // Filter by date range
        .filter((memo) => {
          if (!dateRange.start && !dateRange.end) return true;

          const memoDate = new Date(memo.timestamp * 1000);

          if (dateRange.start && memoDate < dateRange.start) return false;
          if (dateRange.end && memoDate > dateRange.end) return false;
          return true;
        })
    );
  }, [rawMemos, searchTerm, dateRange]);

  const paginatedMemos = useMemo(() => {
    const startIndex = (currentPage - 1) * memosPerPage;
    return filteredMemos.slice(startIndex, startIndex + memosPerPage);
  }, [filteredMemos, currentPage]);

  const totalPages = Math.ceil(filteredMemos.length / memosPerPage);

  const handleFilterChange = useCallback(
    (start: Date | null, end: Date | null) => setDateRange({ start, end }),
    []
  );

  useEffect(() => {
    const fetchMemos = async () => {
      if (!publicKey) {
        setRawMemos([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      setRawMemos([]);

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 100,
        });

        if (!signatures.length) {
          setIsLoading(false);
          return;
        }

        const signatureStrings = signatures.map((s) => s.signature);
        const transactions = await fetchTransactionsForSignatures(
          connection,
          signatureStrings
        );

        const fetchedMemos = parseMemosFromTransactions(
          transactions,
          signatures
        );

        const sortedMemos = fetchedMemos.toSorted(
          (a, b) => b.timestamp - a.timestamp
        );
        setRawMemos(sortedMemos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch memos.");
        consola.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemos();
  }, [publicKey, connection]);

  return {
    memos: paginatedMemos,
    isLoading,
    error,
    setSearchTerm,
    dateRange,
    handleFilterChange,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};

export default useMemoFeed;
