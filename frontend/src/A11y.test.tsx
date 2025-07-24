import { vi, expect } from "vitest";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import StatusDisplay from "./components/StatusDisplay/StatusDisplay";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import SolanaProvider from "./components/SolanaProvider/SolanaProvider";
import MemoForm from "./components/MemoForm/MemoForm";
import WalletConnect from "./components/WalletConnect/WalletConnect";
import App from "./App";

// Mock the wallet adapter context
vi.mock("@solana/wallet-adapter-react", async () => {
  const actual = await vi.importActual("@solana/wallet-adapter-react");
  return {
    ...actual,
    useWallet: () => ({
      connected: false,
      publicKey: null,
    }),
    useConnection: () => ({
      connection: {},
    }),
  };
});

describe("Accessibility", () => {
  it("should have no accessibility violations in App", async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations in WalletConnect", async () => {
    const { container } = render(
      <SolanaProvider>
        <WalletConnect />
      </SolanaProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations in MemoForm", async () => {
    const { container } = render(
      <MemoForm network={WalletAdapterNetwork.Devnet} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations in StatusDisplay", async () => {
    const { container } = render(
      <StatusDisplay
        error=""
        txSignature=""
        network={WalletAdapterNetwork.Devnet}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations in ErrorBoundary", async () => {
    const { container } = render(
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
