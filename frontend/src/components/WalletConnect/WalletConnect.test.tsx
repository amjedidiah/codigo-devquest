import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import WalletConnect from "./WalletConnect";
import { WalletProvider } from "@solana/wallet-adapter-react";
import type { Adapter } from "@solana/wallet-adapter-base";

// CRITICAL: The WalletMultiButton is from an external library and must be mocked to isolate our component's logic and avoid dependency on external UI or wallet state.
vi.mock("@solana/wallet-adapter-react-ui", () => ({
  WalletMultiButton: () => (
    <button aria-label="Select Wallet">Connect Wallet</button>
  ),
}));

describe("WalletConnect", () => {
  it("renders the wallet button with accessible label", () => {
    render(<WalletConnect />);

    expect(screen.getByRole("button", { name: /wallet/i })).toBeInTheDocument();
  });

  it("integrates with wallet provider context", () => {
    // CRITICAL: WalletProvider is required to provide context for wallet adapter components. This ensures the component can access wallet state and context as it would in the real app.
    const mockWallets: Adapter[] = [];
    render(
      <WalletProvider wallets={mockWallets} autoConnect={false}>
        <WalletConnect />
      </WalletProvider>
    );

    expect(screen.getByRole("button", { name: /wallet/i })).toBeInTheDocument();
  });
});
