import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { detectTools } from '../tools/registry';
import { useDebounced } from '../lib/hooks';
import { setHandoff } from '../lib/handoff';
import { toolPath } from '../lib/base';
import ToolIcon from './ToolIcon';

const SAMPLES: { label: string; value: string }[] = [
  { label: 'JWT', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJaaGFuZyBTYW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.Xk3s7YQ1bW9vZ2xlX3NpZ25hdHVyZV9kZW1v' },
  { label: '时间戳', value: '1758758400' },
  { label: 'JSON', value: '{"name":"toolbox","tags":["astro","react"],"stars":0}' },
  { label: 'Base64', value: '5L2g5aW977yM5bel5YW3566xIQ==' },
  { label: '颜色', value: '#6366f1' },
];

/**
 * 首页的智能输入框 —— 这是整个站的差异化所在。
 * 粘贴任意内容，让每个工具的 detect() 自报「我能处理它」，按置信度排序推荐。
 * 点击推荐项时把原文通过 sessionStorage 带过去，落地即是结果。
 */
export default function SmartInput() {
  const [value, setValue] = useState('');
  const debounced = useDebounced(value, 150);
  const hits = useMemo(() => detectTools(debounced), [debounced]);

  const open = (id: string) => {
    setHandoff(value);
    window.location.href = toolPath(id);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="把任何东西粘进来 —— JSON、时间戳、JWT、Base64、颜色值…… 自动识别该用哪个工具"
          className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3.5 pr-11
                     font-mono text-[13px] leading-relaxed shadow-sm scrollbar-thin
                     transition-colors duration-150
                     placeholder:font-sans placeholder:text-fg-subtle/80
                     hover:border-fg-subtle/50 focus:border-brand"
        />
        <Sparkles size={16} className="pointer-events-none absolute right-4 top-4 text-brand/60" />
      </div>

      {value.trim().length === 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-subtle">试试：</span>
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setValue(s.value)}
              className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-xs
                         text-fg-muted transition-colors hover:border-brand hover:text-brand"
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : hits.length === 0 ? (
        <p className="mt-3 text-xs text-fg-subtle">
          没认出这是什么格式 —— 按 <kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">K</kbd> 手动搜索工具
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {hits.map(({ tool, result }) => (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => open(tool.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface
                           px-3.5 py-3 text-left transition-all duration-150
                           hover:border-brand hover:shadow-sm"
              >
                <span className="shrink-0 rounded-lg bg-brand-soft p-2 text-brand">
                  <ToolIcon name={tool.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{tool.name}</span>
                  <span className="block truncate text-xs text-fg-muted">{result.hint}</span>
                </span>
                <span
                  className="shrink-0 font-mono text-[11px] text-fg-subtle tabular-nums"
                  title={`识别置信度 ${Math.round(result.score * 100)}%`}
                >
                  {Math.round(result.score * 100)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
