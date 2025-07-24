import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

// CRITICAL MOCK: console.error must be mocked to prevent test noise and verify error logging
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

// CRITICAL MOCK: window.location.reload must be mocked to prevent actual page reloads during tests
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: mockReload },
  writable: true,
});

// Test component that throws an error when shouldThrow is true
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test error for ErrorBoundary");

  return <div>Normal content</div>;
};

describe("ErrorBoundary", () => {
  afterEach(() => vi.clearAllMocks());

  it("CRITICAL: should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("CRITICAL: should display error UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Normal content")).not.toBeInTheDocument();
  });

  it("CRITICAL: should log error details when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.any(Object)
    );
  });

  it("CRITICAL: should display error stack trace in details section", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const stackTrace = screen.getByLabelText("error stack trace");
    expect(stackTrace).toHaveTextContent("Test error for ErrorBoundary");
  });

  it("CRITICAL: should trigger page reload when refresh button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole("button", { name: "refresh page" });
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("CRITICAL: should render custom fallback when provided", () => {
    const customFallback = <div role="alert">Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
