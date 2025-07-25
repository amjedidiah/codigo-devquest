import { useEffect, useState, type ChangeEventHandler } from "react";
import { useDebounce } from "use-debounce";

export interface SearchBarProps {
  onSearch: (term: string) => void;
}

function useSearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounce(value, 500);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setValue(e.currentTarget.value);

  useEffect(() => {
    if (debouncedValue && debouncedValue === value) onSearch(debouncedValue);
  }, [debouncedValue, value, onSearch]);

  return { searchValue: value, handleChange };
}

export default useSearchBar;
