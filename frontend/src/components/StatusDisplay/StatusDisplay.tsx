import { memo } from "react";
import "./status-display.css";
import useStatusDisplay, { type StatusDisplayProps } from "./useStatusDisplay";

const StatusDisplay = memo(function StatusDisplay(
  props: Readonly<StatusDisplayProps>
) {
  const { explorerUrl, status } = useStatusDisplay(props);

  if (status === "idle") return null;

  return (
    <section aria-label="status display">
      {status === "error" && (
        <p
          role="alert"
          id="errorMessage"
          aria-live="assertive"
          aria-atomic="true"
        >
          {props.error}
        </p>
      )}
      {status === "success" && (
        <p>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
            View transaction
          </a>
        </p>
      )}
    </section>
  );
});

export default StatusDisplay;
