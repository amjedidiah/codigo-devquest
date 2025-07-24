import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MemoForm from "./MemoForm";
import userEvent from "@testing-library/user-event";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

// CRITICAL MOCKS: These hooks interact with external dependencies (Solana blockchain)
// and must be mocked to avoid real blockchain calls in unit tests
vi.mock("./useMemoForm");
vi.mock("../WalletConnect/useWalletConnect");

const mockUseMemoForm = vi.hoisted(() => ({
  memoText: "",
  handleMemoTextChange: vi.fn(),
  isLoading: false,
  error: "",
  txSignature: "",
  handleSubmit: vi.fn(),
  reset: vi.fn(),
}));

const mockUseWalletConnect = vi.hoisted(() => ({
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
}));

describe("MemoForm", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset to default mock implementations
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue(
      mockUseMemoForm
    );
    vi.mocked(
      await import("../WalletConnect/useWalletConnect")
    ).default.mockReturnValue(mockUseWalletConnect);
  });

  it("should render a form with a textarea, submit and reset button", () => {
    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit memo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset form/i })
    ).toBeInTheDocument();
  });

  it("should disable the submit button when wallet is not connected", () => {
    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    expect(screen.getByText(/wallet connection required/i)).toBeInTheDocument();
  });

  it("should enable submit button when wallet is connected", async () => {
    // Mock wallet connected state
    vi.mocked(
      await import("../WalletConnect/useWalletConnect")
    ).default.mockReturnValue({
      ...mockUseWalletConnect,
      connected: true,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    expect(
      screen.getByRole("button", { name: /submit memo/i })
    ).not.toBeDisabled();
    expect(
      screen.queryByText(/wallet connection required/i)
    ).not.toBeInTheDocument();
  });

  it("should update textarea value through controlled component", async () => {
    const user = userEvent.setup();
    const mockHandleChange = vi.fn();

    // Mock the hook to return current memo text and change handler
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      memoText: "Hello Solana",
      handleMemoTextChange: mockHandleChange,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Hello Solana");

    await user.type(textarea, " World");
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("should call handleSubmit when form is submitted", async () => {
    const mockHandleSubmit = vi.fn();

    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      handleSubmit: mockHandleSubmit,
    });

    vi.mocked(
      await import("../WalletConnect/useWalletConnect")
    ).default.mockReturnValue({
      ...mockUseWalletConnect,
      connected: true,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    // Trigger the form's onSubmit
    const form = screen.getByRole("form", { name: /memo form/i });
    fireEvent.submit(form);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should call reset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const mockReset = vi.fn();

    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      reset: mockReset,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    await user.click(screen.getByRole("button", { name: /reset form/i }));

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should display validation error when hook returns error state", async () => {
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      error: "Memo is required",
    });

    vi.mocked(
      await import("../WalletConnect/useWalletConnect")
    ).default.mockReturnValue({
      ...mockUseWalletConnect,
      connected: true,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    expect(screen.getByText("Memo is required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("id", "errorMessage");
  });

  it("should handle loading states during transactions", async () => {
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      isLoading: true,
    });

    vi.mocked(
      await import("../WalletConnect/useWalletConnect")
    ).default.mockReturnValue({
      ...mockUseWalletConnect,
      connected: true,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    expect(screen.getByLabelText("memo form")).toHaveAttribute(
      "aria-busy",
      "true"
    );

    const submitButton = screen.getByRole("button", { name: /submitting.../i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    const resetButton = screen.getByRole("button", { name: /reset form/i });
    expect(resetButton).toBeDisabled();

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should display error message with proper accessibility", async () => {
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      error: "Transaction failed",
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveTextContent("Transaction failed");
    expect(errorElement).toHaveAttribute("id", "errorMessage");
    expect(errorElement).toHaveAttribute("aria-live", "assertive");
  });

  it("should display success state with transaction link", async () => {
    const txSignature = "abc123def456";

    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      txSignature,
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining(txSignature));
    expect(link).toHaveTextContent(/view transaction/i);
  });

  it("should properly describe textarea with error and wallet messages", async () => {
    vi.mocked(await import("./useMemoForm")).default.mockReturnValue({
      ...mockUseMemoForm,
      error: "Memo is required",
    });

    render(<MemoForm network={WalletAdapterNetwork.Devnet} />);

    const textarea = screen.getByRole("textbox");
    const describedBy = textarea.getAttribute("aria-describedby");

    expect(describedBy).toContain("errorMessage");
    expect(describedBy).toContain("walletMessage");
  });
});