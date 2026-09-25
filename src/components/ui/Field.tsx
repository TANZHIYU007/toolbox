import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** 选项行：左边标签，右边控件 */
export default function Field({ label, hint, children, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5', className)}>
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-fg-subtle">{hint}</span>}
    </div>
  );
}
