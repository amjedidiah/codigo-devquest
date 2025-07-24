import { Suspense } from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import SolanaProvider from "./components/SolanaProvider/SolanaProvider";

test("renders wallet connect", async () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <SolanaProvider>
        <App />
      </SolanaProvider>
    </Suspense>
  );
  const walletConnectElement = await screen.findByText(
    /Wallet connection required/i
  );
  expect(walletConnectElement).toBeInTheDocument();
});
