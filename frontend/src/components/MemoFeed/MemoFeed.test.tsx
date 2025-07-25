import { type Mock, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MemoFeed from "./MemoFeed";
import useMemoFeed from "./useMemoFeed";

// CRITICAL MOCK: We mock the useMemoFeed hook to control the state (loading, error, data)
// and test the component's rendering logic in isolation without actual data fetching.
vi.mock("./useMemoFeed");

const mockUseMemoFeed = useMemoFeed as unknown as Mock;

const createMockFeedState = (
  overrides: Partial<ReturnType<typeof useMemoFeed>> = {}
) => ({
  memos: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  setSearchTerm: vi.fn(),
  dateRange: { start: null, end: null },
  handleFilterChange: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  setCurrentPage: vi.fn(),
  ...overrides,
});

describe("MemoFeed", () => {
  it("should render loading state initially", async () => {
    mockUseMemoFeed.mockReturnValue(createMockFeedState({ isLoading: true }));

    render(<MemoFeed />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("should render an error message if fetching fails", async () => {
    mockUseMemoFeed.mockReturnValue(
      createMockFeedState({ error: "Failed to fetch memos" })
    );

    render(<MemoFeed />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to fetch memos/i
      );
    });
  });

  it("should render a list of memos on successful fetch", async () => {
    const mockMemos = [
      { id: "1", content: "Test memo 1", timestamp: Date.now() },
      { id: "2", content: "Test memo 2", timestamp: Date.now() },
    ];
    mockUseMemoFeed.mockReturnValue(createMockFeedState({ memos: mockMemos }));

    render(<MemoFeed />);

    await waitFor(() => {
      const memoList = screen.getAllByRole("listitem");

      expect(memoList).toHaveLength(2);
      expect(memoList[0]).toHaveTextContent("Test memo 1");
      expect(memoList[1]).toHaveTextContent("Test memo 2");
    });
  });

  it("should render an empty state message when no memos are found", async () => {
    mockUseMemoFeed.mockReturnValue(createMockFeedState());

    render(<MemoFeed />);

    await waitFor(() => {
      expect(screen.getByText(/no memos found/i)).toBeInTheDocument();
    });
  });

  it("should filter memos when a search term is entered", async () => {
    const user = userEvent.setup();
    const mockMemos = [
      { id: "1", content: "hello world", timestamp: Date.now() },
      { id: "2", content: "testing", timestamp: Date.now() },
    ];
    const setSearchTerm = vi.fn();

    // Initial render with all memos
    mockUseMemoFeed.mockReturnValue(
      createMockFeedState({ memos: mockMemos, setSearchTerm })
    );

    const { rerender } = render(<MemoFeed />);
    const searchInput = screen.getByLabelText("Search input");
    await user.type(searchInput, "hello");

    // Wait for the debounced search term to be set
    await waitFor(() => {
      expect(setSearchTerm).toHaveBeenCalledWith("hello");
    });

    // Manually trigger the state update that would happen in the hook
    mockUseMemoFeed.mockReturnValue(
      createMockFeedState({
        memos: [mockMemos[0]], // Only "hello world"
        setSearchTerm,
      })
    );

    rerender(<MemoFeed />);

    expect(screen.getByText("hello world")).toBeInTheDocument();
    expect(screen.queryByText("testing")).not.toBeInTheDocument();
  });

  it("should filter memos when a date range is selected", async () => {
    const handleFilterChange = vi.fn();
    const mockMemos = [
      {
        id: "1",
        content: "this memo is from the past",
        timestamp: new Date("2023-01-01").getTime() / 1000,
      },
      {
        id: "2",
        content: "this memo is recent",
        timestamp: Date.now() / 1000,
      },
    ];

    mockUseMemoFeed.mockReturnValue(
      createMockFeedState({ memos: mockMemos, handleFilterChange })
    );

    const { rerender } = render(<MemoFeed />);

    handleFilterChange.mockImplementation((range) => {
      mockUseMemoFeed.mockReturnValue(
        createMockFeedState({
          memos: [mockMemos[0]],
          dateRange: range,
          handleFilterChange,
        })
      );
      rerender(<MemoFeed />);
    });

    const startDateInput = screen.getByLabelText("Start date");
    await userEvent.type(startDateInput, "2023-01-01");

    expect(screen.getByText(/this memo is from the past/i)).toBeInTheDocument();
    expect(screen.queryByText(/this memo is recent/i)).not.toBeInTheDocument();
  });

  it("should update the memo list when pagination controls are used", async () => {
    const setCurrentPage = vi.fn();
    const mockMemos = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      content: `Memo ${i + 1}`,
      timestamp: Date.now() - i * 1000,
    }));

    mockUseMemoFeed.mockReturnValue(
      createMockFeedState({
        memos: mockMemos.slice(0, 10),
        totalPages: 2,
        setCurrentPage,
      })
    );

    const { rerender } = render(<MemoFeed />);

    expect(screen.getByText("Memo 1")).toBeInTheDocument();
    expect(screen.queryByText("Memo 11")).not.toBeInTheDocument();

    setCurrentPage.mockImplementation((page) => {
      mockUseMemoFeed.mockReturnValue(
        createMockFeedState({
          memos: mockMemos.slice(10, 20),
          currentPage: page,
          totalPages: 2,
          setCurrentPage,
        })
      );
      rerender(<MemoFeed />);
    });

    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);

    expect(setCurrentPage).toHaveBeenCalledWith(2);
    expect(screen.queryByText("Memo 1")).not.toBeInTheDocument();
    expect(screen.getByText("Memo 11")).toBeInTheDocument();
  });
});
