import { render, screen } from "@testing-library/react";
import StatusDisplay from "./StatusDisplay";
import type { Network } from "../../types";

describe("StatusDisplay", () => {
  const defaultProps = {
    error: "",
    txSignature: "",
    network: "devnet" as Network,
  };

  it('renders error message with role="alert"', () => {
    render(<StatusDisplay {...defaultProps} error="Something went wrong" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong");
    expect(alert).toHaveAttribute("id", "errorMessage");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-atomic", "true");
  });

  it("renders success state with transaction link", () => {
    const txSignature = "abc123";
    render(<StatusDisplay {...defaultProps} txSignature={txSignature} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining(txSignature));
    expect(link).toHaveAttribute("href", expect.stringContaining("devnet"));
    expect(link).toHaveTextContent(/view transaction/i);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders correct explorer URL for different networks", () => {
    const txSignature = "abc123def456";

    // Test devnet
    const { rerender } = render(
      <StatusDisplay
        {...defaultProps}
        txSignature={txSignature}
        network="devnet"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
    );

    // Test testnet
    rerender(
      <StatusDisplay
        {...defaultProps}
        txSignature={txSignature}
        network="testnet"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `https://explorer.solana.com/tx/${txSignature}?cluster=testnet`
    );

    // Test mainnet-beta (no cluster parameter)
    rerender(
      <StatusDisplay
        {...defaultProps}
        txSignature={txSignature}
        network="mainnet-beta"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `https://explorer.solana.com/tx/${txSignature}`
    );
  });

  it("renders nothing when in idle state (no error or txSignature)", () => {
    render(<StatusDisplay {...defaultProps} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("status display")).not.toBeInTheDocument();
  });

  it("prioritizes error state over success state", () => {
    render(
      <StatusDisplay
        {...defaultProps}
        error="Something went wrong"
        txSignature="abc123"
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders with proper semantic structure", () => {
    render(<StatusDisplay {...defaultProps} error="Test error" />);

    const section = screen.getByLabelText("status display");
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe("SECTION");
  });
});
