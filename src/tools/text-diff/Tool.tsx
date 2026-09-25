import { useEffect, useState } from 'react';
import Panel from '../../components/ui/Panel';
import Segmented from '../../components/ui/Segmented';
import { cn } from '../../lib/cn';
import { useDebounced, useLocalStorage, useToolInput } from '../../lib/hooks';

type Mode = 'lines' | 'chars' | 'words';

interface Part {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function TextDiffTool() {
  const [left, setLeft] = useToolInput('');
  const [right, setRight] = useState('');
  const [mode, setMode] = useLocalStorage<Mode>('tool:diff:mode', 'lines');
  const [parts, setParts] = useState<Part[]>([]);

  const debouncedLeft = useDebounced(left, 200);
  const debouncedRight = useDebounced(right, 200);

  useEffect(() => {
    if (!debouncedLeft && !debouncedRight) {
      setParts([]);
      return;
    }

    let cancelled = false;
    // diff 库只在真的用到本工具时才下载
    import('diff')
      .then((d) => {
        // 必须分开调用：这几个函数都有重载，先赋给变量会塌缩成「必须传 options」的那个签名
        switch (mode) {
          case 'lines':
            return d.diffLines(debouncedLeft, debouncedRight);
          case 'words':
            return d.diffWords(debouncedLeft, debouncedRight);
          default:
            return d.diffChars(debouncedLeft, debouncedRight);
        }
      })
      .then((result) => {
        if (!cancelled) setParts(result);
      })
      .catch(() => {
        if (!cancelled) setParts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedLeft, debouncedRight, mode]);

  const added = parts.filter((p) => p.added).reduce((n, p) => n + p.value.length, 0);
  const removed = parts.filter((p) => p.removed).reduce((n, p) => n + p.value.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          aria-label="对比粒度"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'lines', label: '按行' },
            { value: 'words', label: '按词' },
            { value: 'chars', label: '按字符' },
          ]}
        />
        {parts.length > 0 && (
          <span className="font-mono text-xs">
            <span className="text-success">+{added}</span>
            <span className="mx-1.5 text-fg-subtle">/</span>
            <span className="text-danger">-{removed}</span>
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="diff-left" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            原文
          </label>
          <textarea
            id="diff-left"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            rows={12}
            spellCheck={false}
            placeholder="粘贴第一段文本…"
            className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-3 font-mono
                       text-[13px] leading-relaxed scrollbar-thin transition-colors
                       placeholder:font-sans placeholder:text-fg-subtle/70 hover:border-fg-subtle/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="diff-right" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            对比文本
          </label>
          <textarea
            id="diff-right"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            rows={12}
            spellCheck={false}
            placeholder="粘贴第二段文本…"
            className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-3 font-mono
                       text-[13px] leading-relaxed scrollbar-thin transition-colors
                       placeholder:font-sans placeholder:text-fg-subtle/70 hover:border-fg-subtle/50"
          />
        </div>
      </div>

      {parts.length > 0 && (
        <Panel title="差异">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-2 p-3 font-mono text-[13px] leading-relaxed scrollbar-thin">
            {parts.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.added && 'bg-success/20 text-success',
                  part.removed && 'bg-danger/20 text-danger line-through',
                )}
              >
                {part.value}
              </span>
            ))}
          </pre>
          <p className="mt-2 text-xs text-fg-subtle">
            <span className="text-success">绿色</span> = 新增，
            <span className="text-danger">红色删除线</span> = 删除，无标记 = 未改动
          </p>
        </Panel>
      )}
    </div>
  );
}
