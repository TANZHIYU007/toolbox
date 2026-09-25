import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import { useDebounced, useToolInput } from '../../lib/hooks';

const PRESETS: { expr: string; label: string }[] = [
  { expr: '*/5 * * * *', label: '每 5 分钟' },
  { expr: '0 * * * *', label: '每小时整点' },
  { expr: '0 9 * * 1-5', label: '工作日早 9 点' },
  { expr: '0 0 * * *', label: '每天午夜' },
  { expr: '0 3 * * 0', label: '每周日凌晨 3 点' },
  { expr: '0 0 1 * *', label: '每月 1 号' },
];

const FIELDS = [
  ['分钟', '0-59'],
  ['小时', '0-23'],
  ['日', '1-31'],
  ['月', '1-12'],
  ['星期', '0-6（0 是周日）'],
];

export default function CronTool() {
  const [input, setInput] = useToolInput('');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounced(input, 250);

  useEffect(() => {
    const expr = debounced.trim();
    if (!expr) {
      setDescription('');
      setNextRuns([]);
      setError(null);
      return;
    }

    let cancelled = false;

    // 两个库都只在本工具用到，动态加载
    Promise.all([import('cronstrue/i18n'), import('cron-parser')])
      .then(([cronstrueModule, cronParser]) => {
        // cronstrue/i18n 只有 default 导出，直接用命名空间会拿到 Function.prototype.toString
        const cronstrue = cronstrueModule.default;
        if (cancelled) return;

        let text = '';
        try {
          text = cronstrue.toString(expr, { locale: 'zh_CN', use24HourTimeFormat: true });
        } catch (err) {
          setError(err instanceof Error ? err.message : '无法解析这个表达式');
          setDescription('');
          setNextRuns([]);
          return;
        }

        const runs: Date[] = [];
        try {
          const interval = cronParser.CronExpressionParser.parse(expr);
          for (let i = 0; i < 5; i += 1) runs.push(interval.next().toDate());
        } catch {
          // 描述能解析出来但算不出下次执行时间（比如某些 Quartz 专有语法），不算致命
        }

        setDescription(text);
        setNextRuns(runs);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError('解析库加载失败');
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const fields = input.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="cron-input" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Cron 表达式
        </label>
        <input
          id="cron-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="0 9 * * 1-5"
          className={`h-12 rounded-xl border bg-surface px-3.5 font-mono text-base tracking-wide transition-colors
                      placeholder:text-fg-subtle/70
                      ${error ? 'border-danger' : 'border-border hover:border-fg-subtle/50'}`}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <Button key={p.expr} size="sm" onClick={() => setInput(p.expr)}>
            {p.label}
          </Button>
        ))}
      </div>

      {description && (
        <div className="rounded-xl border border-brand/30 bg-brand-soft px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand/70">含义</p>
          <p className="mt-1 text-sm font-medium text-fg">{description}</p>
        </div>
      )}

      {fields.length >= 5 && fields.length <= 6 && (
        <Panel title="字段拆解">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FIELDS.map(([name, range], i) => {
              // 6 字段表达式最前面多一个「秒」，其余字段整体后移
              const value = fields.length === 6 ? fields[i + 1] : fields[i];
              return (
                <div key={name} className="rounded-lg bg-surface-2 px-3 py-2">
                  <p className="text-xs text-fg-subtle">{name}</p>
                  <p className="mt-0.5 font-mono text-sm text-fg">{value ?? '—'}</p>
                  <p className="mt-0.5 text-[10px] text-fg-subtle">{range}</p>
                </div>
              );
            })}
          </div>
          {fields.length === 6 && (
            <p className="mt-2 text-xs text-fg-subtle">
              检测到 6 个字段，第一个 <code className="font-mono">{fields[0]}</code> 是秒
            </p>
          )}
        </Panel>
      )}

      {nextRuns.length > 0 && (
        <Panel title="接下来 5 次执行">
          <div className="space-y-2">
            {nextRuns.map((date, i) => (
              <ResultRow
                key={i}
                label={`第 ${i + 1} 次`}
                value={date.toLocaleString('zh-CN', { hour12: false })}
                note={i === 0 ? '最近一次' : undefined}
              />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
