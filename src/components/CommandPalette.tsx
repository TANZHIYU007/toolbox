import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchTools, toolMap, tools, type SearchHit } from '../tools/registry';
import { categoryName } from '../tools/categories';
import { getRecent } from '../lib/recent';
import { toolPath } from '../lib/base';
import { cn } from '../lib/cn';
import ToolIcon from './ToolIcon';

const MAX_RESULTS = 8;

/** 打开面板的全局事件。Header 里的按钮只需 dispatch 它，不必也是个 React 岛屿 */
export const OPEN_EVENT = 'toolbox:open-palette';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const show = useCallback(() => {
    setRecent(getRecent());
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);

  // Ctrl/Cmd + K 开关，以及来自 Header 按钮的自定义事件
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => {
          if (!v) show();
          return !v;
        });
      }
    };
    const onOpen = () => show();

    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [show]);

  // 打开时聚焦输入框、锁滚动
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results: SearchHit[] = useMemo(() => {
    if (query.trim()) return searchTools(query).slice(0, MAX_RESULTS);

    // 空查询：先最近使用，再补常用
    const recentHits = recent
      .map((id) => toolMap.get(id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((tool) => ({ tool, score: 1 }));
    const rest = tools
      .filter((t) => !recent.includes(t.id))
      .map((tool) => ({ tool, score: 0 }));
    return [...recentHits, ...rest].slice(0, MAX_RESULTS);
  }, [query, recent]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = useCallback((id: string) => {
    window.location.href = toolPath(id);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.tool.id);
    }
  };

  // 键盘移动时把高亮项滚进视野
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="搜索工具"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border-soft px-4">
          <Search size={17} className="shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具…（试试 json、时间、base64）"
            className="h-13 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-subtle"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="rounded-md p-1 text-fg-subtle hover:bg-surface-2 hover:text-fg"
          >
            <X size={16} />
          </button>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-fg-subtle">没有匹配的工具</p>
        ) : (
          <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2 scrollbar-thin">
            {results.map((hit, i) => (
              <li key={hit.tool.id}>
                <button
                  type="button"
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit.tool.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    i === active ? 'bg-brand-soft' : 'hover:bg-surface-2',
                  )}
                >
                  <span className="shrink-0 text-brand">
                    <ToolIcon name={hit.tool.icon} size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">{hit.tool.name}</span>
                    <span className="block truncate text-xs text-fg-subtle">{hit.tool.description}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-fg-subtle">
                    {categoryName(hit.tool.category)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-4 border-t border-border-soft bg-surface-2/50 px-4 py-2 text-[11px] text-fg-subtle">
          <span><kbd className="font-mono">↑↓</kbd> 选择</span>
          <span><kbd className="font-mono">Enter</kbd> 打开</span>
          <span><kbd className="font-mono">Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  );
}
