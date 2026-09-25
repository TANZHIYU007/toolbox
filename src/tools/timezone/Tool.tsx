import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { cn } from '../../lib/cn';
import { useLocalStorage } from '../../lib/hooks';

interface Zone {
  id: string;
  city: string;
}

const ZONES: Zone[] = [
  { id: 'Asia/Shanghai', city: '北京 / 上海' },
  { id: 'Asia/Tokyo', city: '东京' },
  { id: 'Asia/Singapore', city: '新加坡' },
  { id: 'Asia/Kolkata', city: '新德里' },
  { id: 'Asia/Dubai', city: '迪拜' },
  { id: 'Europe/Moscow', city: '莫斯科' },
  { id: 'Europe/London', city: '伦敦' },
  { id: 'Europe/Paris', city: '巴黎 / 柏林' },
  { id: 'America/New_York', city: '纽约' },
  { id: 'America/Chicago', city: '芝加哥' },
  { id: 'America/Los_Angeles', city: '洛杉矶 / 旧金山' },
  { id: 'Australia/Sydney', city: '悉尼' },
  { id: 'UTC', city: 'UTC 协调世界时' },
];

/** 把 Date 格式化成 <input type="datetime-local"> 要的格式（按指定时区） */
function toLocalInputValue(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}`;
}

/** 已知「某时区的墙上时间」，反推出对应的 UTC 时刻 */
function zonedWallTimeToDate(wall: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(wall);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];

  // 先当成 UTC，再用该时区下的实际显示值反推偏移量并修正
  const guess = Date.UTC(y!, mo! - 1, d!, h!, mi!);
  const shown = new Date(guess);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(shown);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'),
    get('hour') === 24 ? 0 : get('hour'), get('minute'), get('second'));
  return new Date(guess - (asUtc - guess));
}

function offsetLabel(date: Date, timeZone: string): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? '';
  return name.replace('GMT', 'UTC');
}

export default function TimezoneTool() {
  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [baseZone, setBaseZone] = useLocalStorage('tool:tz:base', localZone);
  const [wall, setWall] = useState(() => toLocalInputValue(new Date(), localZone));

  // 基准时区换了之后，保持「同一个绝对时刻」而不是同一个墙上读数
  const instant = useMemo(() => zonedWallTimeToDate(wall, baseZone), [wall, baseZone]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const reference = instant ?? new Date(now);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <label htmlFor="tz-time" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            基准时间
          </label>
          <input
            id="tz-time"
            type="datetime-local"
            value={wall}
            onChange={(e) => setWall(e.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3.5 font-mono text-sm
                       transition-colors hover:border-fg-subtle/50"
          />
        </div>

        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <label htmlFor="tz-base" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            基准时区
          </label>
          <select
            id="tz-base"
            value={baseZone}
            onChange={(e) => setBaseZone(e.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm
                       transition-colors hover:border-fg-subtle/50"
          >
            {!ZONES.some((z) => z.id === localZone) && (
              <option value={localZone}>{localZone}（本机）</option>
            )}
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.city}　{z.id}
              </option>
            ))}
          </select>
        </div>

        <Button
          size="md"
          onClick={() => {
            setWall(toLocalInputValue(new Date(), baseZone));
            setNow(Date.now());
          }}
        >
          现在
        </Button>
      </div>

      <Field label="" hint={`本机时区：${localZone}`}>
        <span />
      </Field>

      <div className="space-y-2">
        {ZONES.map((zone) => {
          const isBase = zone.id === baseZone;
          const formatted = new Intl.DateTimeFormat('zh-CN', {
            timeZone: zone.id,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
          }).format(reference);

          return (
            <div
              key={zone.id}
              className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-2.5',
                isBase ? 'border-brand bg-brand-soft' : 'border-border-soft bg-surface',
              )}
            >
              <span className={cn('w-32 shrink-0 text-sm font-medium', isBase ? 'text-brand' : 'text-fg')}>
                {zone.city}
              </span>
              <code className="min-w-0 flex-1 font-mono text-[13px] tabular-nums text-fg">{formatted}</code>
              <span className="shrink-0 font-mono text-xs text-fg-subtle">
                {offsetLabel(reference, zone.id)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
