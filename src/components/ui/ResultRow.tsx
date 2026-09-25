import { cn } from '../../lib/cn';
import CopyButton from './CopyButton';

interface Props {
  label: string;
  value: string;
  /** 额外的说明文字，例如时间戳旁边的「3 小时前」 */
  note?: string;
  className?: string;
}

/** 「字段名 → 值 → 复制」的一行，哈希、JWT、颜色、时间戳这类多结果输出都用它 */
export default function ResultRow({ label, value, note, className }: Props) {
  return (
    <div
      className={cn(
        'group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2.5',
        'border border-border-soft bg-surface transition-colors hover:border-border',
        className,
      )}
    >
      <span className="w-28 shrink-0 text-xs font-semibold text-fg-subtle">{label}</span>
      <code className="min-w-0 flex-1 break-all font-mono text-[13px] text-fg">
        {value || <span className="text-fg-subtle">—</span>}
      </code>
      {note && <span className="shrink-0 text-xs text-fg-subtle">{note}</span>}
      <CopyButton value={value} className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />
    </div>
  );
}
