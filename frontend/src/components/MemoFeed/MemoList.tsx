import type { Memo } from "./useMemoFeed";
import MemoItem from "./MemoItem";
import "./memo-list.css";

interface MemoListProps {
  memos: Memo[];
}

function MemoList({ memos }: Readonly<MemoListProps>) {
  return (
    <ul aria-label="memo list">
      {memos.map((memo) => (
        <MemoItem key={memo.id} {...memo} />
      ))}
    </ul>
  );
}

export default MemoList;
