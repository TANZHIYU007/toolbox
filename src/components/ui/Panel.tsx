import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface Props {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** 卡片容器。工具里用来给「选项区」「结果区」分块 */
export default function Panel({ title, children, className }: Props) {
  return (
    <section className={cn('rounded-xl border border-border bg-surface/60 p-4', className)}>
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{title}</h3>
      )}
      {children}
    </section>
  );
}
