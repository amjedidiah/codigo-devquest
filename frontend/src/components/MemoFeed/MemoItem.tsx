import { type Memo } from "./useMemoFeed";
import "./memo-item.css";
import { formatRelative } from "date-fns";

function MemoItem({ id, content, timestamp }: Readonly<Memo>) {
  const date = new Date(timestamp * 1000);
  const friendlyDate = formatRelative(date, new Date());
  return (
    <li aria-label={`memo-item-${id}`}>
      <p>{content}</p>
      <time dateTime={date.toISOString()}>{friendlyDate}</time>
    </li>
  );
}

export default MemoItem;
