import { useId } from 'react';
import { cn } from '../../lib/cn';
import CopyButton from './CopyButton';

interface Props {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** 只读 = 输出区，自动带复制按钮 */
  readOnly?: boolean;
  mono?: boolean;
  /** 右上角额外放点东西（模式切换、选项之类） */
  actions?: React.ReactNode;
  error?: string | null;
  className?: string;
}

/**
 * 带标签、字数统计、复制按钮的文本框。
 * 绝大多数工具的输入和输出都是它，所以单个工具的代码能压到几十行。
 */
export default function IOArea({
  label, value, onChange, placeholder, rows = 8,
  readOnly = false, mono = true, actions, error, className,
}: Props) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-2 min-w-0', className)}>
      <div className="flex items-center justify-between gap-2 min-h-7">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {actions}
          {readOnly && <CopyButton value={value} />}
        </div>
      </div>

      <textarea
        id={id}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        className={cn(
          'w-full resize-y rounded-xl border bg-surface px-3.5 py-3 text-sm leading-relaxed',
          'placeholder:text-fg-subtle/70 scrollbar-thin',
          'transition-colors duration-150',
          mono && 'font-mono text-[13px]',
          error ? 'border-danger' : 'border-border hover:border-fg-subtle/50',
          readOnly && 'bg-surface-2 text-fg-muted',
        )}
      />

      <div className="flex items-center justify-between gap-2 min-h-4 text-xs">
        <span className={cn('text-danger', !error && 'invisible')}>{error ?? '占位'}</span>
        <span className="shrink-0 text-fg-subtle tabular-nums">
          {value.length > 0 ? `${value.length} 字符` : ''}
        </span>
      </div>
    </div>
  );
}
