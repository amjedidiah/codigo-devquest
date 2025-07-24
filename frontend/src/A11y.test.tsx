import { vi, expect, describe, it } from "vitest";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { render, waitFor } from "@testing-library/react";
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

// Helper function to run accessibility checks
const checkA11y = async (ui: React.ReactElement) => {
  const { container } = render(ui);
  await waitFor(async () => {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
};

describe("Accessibility", () => {
  const components = [
    { name: "App", ui: <App /> },
    {
      name: "WalletConnect",
      ui: (
        <SolanaProvider>
          <WalletConnect />
        </SolanaProvider>
      ),
    },
    {
      name: "MemoForm",
      ui: <MemoForm network={WalletAdapterNetwork.Devnet} />,
    },
    {
      name: "StatusDisplay",
      ui: (
        <StatusDisplay
          error=""
          txSignature=""
          network={WalletAdapterNetwork.Devnet}
        />
      ),
    },
    {
      name: "ErrorBoundary",
      ui: (
        <ErrorBoundary>
          <div />
        </ErrorBoundary>
      ),
    },
  ];

  describe.each(components)("$name component", ({ ui }) => {
    it("should have no accessibility violations", async () => {
      await checkA11y(ui);
    });
  });
});
