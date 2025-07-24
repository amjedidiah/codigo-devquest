import { Component, type ErrorInfo, type ReactNode } from "react";
import "./error-boundary.css";
import consola from "consola";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app.
 *
 * This is particularly important for Solana dApps where wallet/blockchain
 * interactions can throw unexpected errors.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    consola.error("ErrorBoundary caught an error:", error, errorInfo);

    // In production, this will be sent to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or use provided fallback
      return (
        this.props.fallback ?? (
          <section role="alert" aria-label="error boundary">
            <h2>Something went wrong</h2>
            <p>
              We encountered an unexpected error. Please refresh the page and
              try again.
            </p>
            <details>
              <summary>Error Details (for developers)</summary>
              <pre aria-label="error stack trace">
                {this.state.error?.stack ?? this.state.error?.message}
              </pre>
            </details>
            <button onClick={this.handleRefresh} aria-label="refresh page">
              Refresh Page
            </button>
          </section>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
