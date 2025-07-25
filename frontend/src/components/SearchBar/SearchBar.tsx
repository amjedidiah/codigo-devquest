import "./search-bar.css";
import useSearchBar, { type SearchBarProps } from "./useSearchBar";

function SearchBar(props: Readonly<SearchBarProps>) {
  const { searchValue, handleChange } = useSearchBar(props);

  return (
    <div aria-label="search bar">
      <input
        type="search"
        placeholder="Search memos..."
        value={searchValue}
        onChange={handleChange}
        aria-label="Search input"
      />
    </div>
  );
}

export default SearchBar;
