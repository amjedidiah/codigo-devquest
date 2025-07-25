import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("should render an input with the correct placeholder", () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.getByPlaceholderText("Search memos...")).toBeInTheDocument();
  });

  it("should debounce search calls", async () => {
    const user = userEvent.setup();
    const onSearchMock = vi.fn();

    render(<SearchBar onSearch={onSearchMock} />);

    const input = screen.getByLabelText("Search input");

    // Type multiple characters quickly
    await user.type(input, "test");

    // Should only be called once: after debounce with "test"
    await waitFor(
      () => {
        expect(onSearchMock).toHaveBeenCalledTimes(1);
        expect(onSearchMock).toHaveBeenNthCalledWith(1, "test"); // Debounced call
      },
      { timeout: 1000 }
    );
  });
});
