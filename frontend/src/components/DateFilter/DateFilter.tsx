import "./date-filter.css";
import { format } from "date-fns";

interface DateFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
}

function DateFilter({
  onFilterChange,
  startDate,
  endDate,
}: Readonly<DateFilterProps>) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.valueAsDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(startDate, e.target.valueAsDate);
  };

  return (
    <fieldset aria-label="date filter">
      <legend>Date Filter</legend>
      <input
        type="date"
        aria-label="Start date"
        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
        onChange={handleStartDateChange}
      />
      <input
        type="date"
        aria-label="End date"
        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
        onChange={handleEndDateChange}
      />
    </fieldset>
  );
}

export default DateFilter;
