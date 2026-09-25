import { cn } from '../../lib/cn';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/** 开关：给「URL 安全字符」「大写输出」这类布尔选项用 */
export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-brand' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </button>
      <span className="text-xs font-medium text-fg-muted">{label}</span>
    </label>
  );
}
