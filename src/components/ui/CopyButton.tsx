import { Check, Copy } from 'lucide-react';
import { useCopy } from '../../lib/hooks';
import { cn } from '../../lib/cn';

interface Props {
  value: string;
  label?: string;
  className?: string;
}

/** 到处都在用的复制按钮：点一下变成「已复制」，1.5 秒后恢复 */
export default function CopyButton({ value, label, className }: Props) {
  const { copied, copy } = useCopy();
  const disabled = value.length === 0;

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      disabled={disabled}
      aria-label={label ?? '复制'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
        'transition-colors duration-150',
        copied ? 'text-success' : 'text-fg-subtle hover:text-fg hover:bg-surface-2',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
    >
      {copied ? <Check size={13} strokeWidth={2.4} /> : <Copy size={13} strokeWidth={2} />}
      <span>{copied ? '已复制' : (label ?? '复制')}</span>
    </button>
  );
}
