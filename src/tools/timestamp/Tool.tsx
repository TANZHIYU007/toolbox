import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import { useToolInput } from '../../lib/hooks';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatUtc(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
         `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

function formatRelative(d: Date, now: number): string {
  const diff = d.getTime() - now;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [1000, '秒'], [60_000, '分钟'], [3_600_000, '小时'],
    [86_400_000, '天'], [2_592_000_000, '个月'], [31_536_000_000, '年'],
  ];

  let value = abs / 1000;
  let unit = '秒';
  for (let i = units.length - 1; i >= 0; i -= 1) {
    if (abs >= units[i]![0]) {
      value = abs / units[i]![0];
      unit = units[i]![1];
      break;
    }
  }
  const rounded = value < 10 ? value.toFixed(1).replace(/\.0$/, '') : Math.round(value);
  return diff >= 0 ? `${rounded} ${unit}后` : `${rounded} ${unit}前`;
}

/** 输入既可以是时间戳（10/13 位数字），也可以是日期字符串 */
function parseInput(raw: string): Date | null {
  const text = raw.trim();
  if (!text) return null;

  if (/^\d{1,13}$/.test(text)) {
    const ms = text.length >= 12 ? Number(text) : Number(text) * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // 「2026-09-25 10:00:00」这种带空格的写法 Safari 会解析失败，替换成 T
  const normalized = text.replace(/^(\d{4}-\d{2}-\d{2})[ ](\d{2}:\d{2})/, '$1T$2');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function TimestampTool() {
  const [input, setInput] = useToolInput('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = useMemo(() => parseInput(input), [input]);
  const invalid = input.trim().length > 0 && date === null;

  return (
    <div className="space-y-5">
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">当前时间</p>
          <p className="mt-1 font-mono text-sm text-fg">{formatLocal(new Date(now))}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">当前时间戳</p>
          <p className="mt-1 font-mono text-sm text-fg tabular-nums">{Math.floor(now / 1000)}</p>
        </div>
      </Panel>

      <div className="flex flex-col gap-2">
        <label htmlFor="ts-input" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          时间戳或日期
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="ts-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="1758758400 或 2026-09-25 10:00:00"
            className={`h-10 min-w-0 flex-1 rounded-xl border bg-surface px-3.5 font-mono text-sm
                        transition-colors placeholder:font-sans placeholder:text-fg-subtle/70
                        ${invalid ? 'border-danger' : 'border-border hover:border-fg-subtle/50'}`}
          />
          <Button size="md" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
            填入现在
          </Button>
          <Button size="md" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            清空
          </Button>
        </div>
        {invalid && <p className="text-xs text-danger">无法解析这个时间，试试 10/13 位时间戳或 2026-09-25 10:00:00</p>}
      </div>

      {date && (
        <div className="space-y-2">
          <ResultRow label="秒级时间戳" value={String(Math.floor(date.getTime() / 1000))} />
          <ResultRow label="毫秒时间戳" value={String(date.getTime())} />
          <ResultRow label="本地时间" value={formatLocal(date)} note={formatRelative(date, now)} />
          <ResultRow label="UTC 时间" value={formatUtc(date)} />
          <ResultRow label="ISO 8601" value={date.toISOString()} />
          <ResultRow label="中文格式" value={date.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'medium' })} />
        </div>
      )}
    </div>
  );
}
