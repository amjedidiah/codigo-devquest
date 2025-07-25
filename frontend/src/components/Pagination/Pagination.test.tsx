import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("should render the current page and total pages", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it('should disable the "Previous" button on the first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it('should disable the "Next" button on the last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it('should call onPageChange with the correct page number when "Next" is clicked', async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChangeMock}
      />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChangeMock).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with the correct page number when "Previous" is clicked', async () => {
    const user = userEvent.setup();
    const onPageChangeMock = vi.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={onPageChangeMock}
      />
    );

    await user.click(screen.getByRole("button", { name: "Previous" }));

    expect(onPageChangeMock).toHaveBeenCalledWith(1);
  });
});
