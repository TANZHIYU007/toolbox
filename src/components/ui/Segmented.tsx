import { cn } from '../../lib/cn';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

/** 分段控制器，用于「编码 / 解码」这类互斥模式切换 */
export default function Segmented<T extends string>({
  options, value, onChange, className, ...rest
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className={cn('inline-flex rounded-lg bg-surface-2 p-0.5 border border-border-soft', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150',
              active ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
