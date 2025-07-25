import "./memo-feed.css";
import useMemoFeed from "./useMemoFeed";
import SearchBar from "../SearchBar/SearchBar";
import DateFilter from "../DateFilter/DateFilter";
import Pagination from "../Pagination/Pagination";
import MemoList from "./MemoList";

function MemoFeed() {
  const {
    memos,
    isLoading,
    error,
    setSearchTerm,
    dateRange,
    handleFilterChange,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useMemoFeed();

  if (isLoading) return <output>Loading...</output>;

  if (error) return <div role="alert">{error}</div>;

  return (
    <article aria-label="memo feed">
      <SearchBar onSearch={setSearchTerm} />
      <DateFilter
        onFilterChange={handleFilterChange}
        startDate={dateRange.start}
        endDate={dateRange.end}
      />
      {memos.length === 0 ? <p>No memos found.</p> : <MemoList memos={memos} />}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </article>
  );
}

export default MemoFeed;
