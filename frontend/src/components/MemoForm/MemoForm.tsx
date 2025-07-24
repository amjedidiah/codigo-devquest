import { useMemo } from "react";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import "./memo-form.css";
import useMemoForm from "./useMemoForm";
import useWalletConnect from "../WalletConnect/useWalletConnect";
import type { Network } from "../../types";

interface MemoFormProps {
  network?: Network;
}

function MemoForm({ network = "devnet" }: Readonly<MemoFormProps>) {
  const {
    memoText,
    handleMemoTextChange,
    isLoading,
    error,
    txSignature,
    handleSubmit,
    reset,
  } = useMemoForm();
  const { connected: isWalletConnected } = useWalletConnect();

  // Memoizing computed values that depend on multiple state variables
  const { describedBy, buttonText, isDisabled } = useMemo(() => {
    const ids = [];
    if (error) ids.push("errorMessage");
    if (!isWalletConnected) ids.push("walletMessage");

    return {
      describedBy: ids.length > 0 ? ids.join(" ") : undefined,
      buttonText: isLoading ? "Submitting..." : "Submit Memo",
      isDisabled: !isWalletConnected || isLoading,
    };
  }, [isWalletConnected, error, isLoading]);

  // Memoizing StatusDisplay props to prevent unnecessary re-renders
  const statusDisplayProps = useMemo(
    () => ({
      error,
      txSignature,
      network,
    }),
    [error, txSignature, network]
  );

  return (
    <form aria-label="memo form" onSubmit={handleSubmit} aria-busy={isLoading}>
      {!isWalletConnected && (
        <output aria-live="polite" id="walletMessage">
          <strong>Wallet connection required:</strong> Please connect your
          wallet to submit a memo.
        </output>
      )}

      <article id="memoInputGroup">
        <label htmlFor="memo">
          Memo <span aria-hidden="true">*</span>
        </label>
        <textarea
          name="memo"
          id="memo"
          aria-required="true"
          aria-describedby={describedBy}
          placeholder="Enter your memo text here"
          disabled={isLoading}
          value={memoText}
          onChange={handleMemoTextChange}
          rows={4}
          required
        />
      </article>

      <div className="button-group">
        <button
          type="submit"
          aria-busy={isLoading}
          aria-disabled={isDisabled}
          disabled={isDisabled}
        >
          {buttonText}
        </button>

        <button
          type="button"
          aria-label="Reset form"
          aria-disabled={isLoading}
          disabled={isLoading}
          onClick={reset}
        >
          Reset
        </button>
      </div>

      {/* StatusDisplay for transaction status, error, success */}
      <StatusDisplay {...statusDisplayProps} />
    </form>
  );
}

export default MemoForm;
