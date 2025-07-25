import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateFilter from "./DateFilter";

describe("DateFilter", () => {
  it("should render two date inputs", () => {
    render(
      <DateFilter startDate={null} endDate={null} onFilterChange={() => {}} />
    );

    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("End date")).toBeInTheDocument();
  });

  it("should call onFilterChange when the start date changes", async () => {
    const user = userEvent.setup();
    const onFilterChangeMock = vi.fn();

    render(
      <DateFilter
        startDate={null}
        endDate={null}
        onFilterChange={onFilterChangeMock}
      />
    );

    const startDateInput = screen.getByLabelText("Start date");
    await user.type(startDateInput, "2024-01-01");

    expect(onFilterChangeMock).toHaveBeenCalledWith(
      new Date("2024-01-01"),
      null
    );
  });

  it("should call onFilterChange when the end date changes", async () => {
    const user = userEvent.setup();
    const onFilterChangeMock = vi.fn();

    render(
      <DateFilter
        startDate={null}
        endDate={null}
        onFilterChange={onFilterChangeMock}
      />
    );

    const endDateInput = screen.getByLabelText("End date");
    await user.type(endDateInput, "2024-12-31");

    expect(onFilterChangeMock).toHaveBeenCalledWith(
      null,
      new Date("2024-12-31")
    );
  });
});
