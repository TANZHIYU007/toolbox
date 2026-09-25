import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import ResultRow from '../../components/ui/ResultRow';
import Segmented from '../../components/ui/Segmented';
import { useLocalStorage } from '../../lib/hooks';

type Kind = 'linear' | 'radial';

interface Stop {
  color: string;
  position: number;
}

const PRESETS: { name: string; stops: Stop[]; angle: number }[] = [
  { name: '黄昏', angle: 135, stops: [{ color: '#fa709a', position: 0 }, { color: '#fee140', position: 100 }] },
  { name: '深海', angle: 160, stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }] },
  { name: '紫罗兰', angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { name: '薄荷', angle: 120, stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }] },
  { name: '暗夜', angle: 180, stops: [{ color: '#232526', position: 0 }, { color: '#414345', position: 100 }] },
];

export default function GradientTool() {
  const [kind, setKind] = useLocalStorage<Kind>('tool:grad:kind', 'linear');
  const [angle, setAngle] = useLocalStorage('tool:grad:angle', 135);
  const [stops, setStops] = useState<Stop[]>([
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 },
  ]);

  const css = useMemo(() => {
    const parts = [...stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(', ');
    return kind === 'linear'
      ? `linear-gradient(${angle}deg, ${parts})`
      : `radial-gradient(circle at center, ${parts})`;
  }, [kind, angle, stops]);

  const update = (index: number, patch: Partial<Stop>) => {
    setStops(stops.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    if (stops.length >= 5) return;
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const last = sorted[sorted.length - 1]!;
    const prev = sorted[sorted.length - 2] ?? last;
    setStops([...stops, { color: last.color, position: Math.round((prev.position + last.position) / 2) }]);
  };

  return (
    <div className="space-y-5">
      <div
        className="h-44 rounded-xl border border-border transition-all duration-200"
        style={{ backgroundImage: css }}
        role="img"
        aria-label="渐变预览"
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          aria-label="渐变类型"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'linear', label: '线性' },
            { value: 'radial', label: '径向' },
          ]}
        />
        {kind === 'linear' && (
          <Field label="角度" hint={`${angle}deg`}>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              aria-label="渐变角度"
              className="w-44 accent-[var(--brand)]"
            />
          </Field>
        )}
      </div>

      <div className="space-y-2">
        {stops.map((stop, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-border-soft bg-surface px-3 py-2.5">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => update(i, { color: e.target.value })}
              aria-label={`色标 ${i + 1} 颜色`}
              className="size-8 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
            />
            <code className="w-20 shrink-0 font-mono text-xs text-fg-muted">{stop.color}</code>
            <input
              type="range"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => update(i, { position: Number(e.target.value) })}
              aria-label={`色标 ${i + 1} 位置`}
              className="min-w-24 flex-1 accent-[var(--brand)]"
            />
            <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-fg-subtle">
              {stop.position}%
            </span>
            <button
              type="button"
              onClick={() => setStops(stops.filter((_, idx) => idx !== i))}
              disabled={stops.length <= 2}
              aria-label={`删除色标 ${i + 1}`}
              className="shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors
                         hover:bg-surface-2 hover:text-danger
                         disabled:pointer-events-none disabled:opacity-30"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={addStop} disabled={stops.length >= 5}>
          <Plus size={14} />
          添加色标
        </Button>
        <div className="flex-1" />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setStops(preset.stops);
                setAngle(preset.angle);
                setKind('linear');
              }}
              title={preset.name}
              aria-label={`使用预设：${preset.name}`}
              className="size-7 rounded-lg border border-border/60 transition-transform hover:scale-110"
              style={{
                backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.stops.map((s) => s.color).join(', ')})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <ResultRow label="background" value={`background: ${css};`} />
        <ResultRow label="仅渐变值" value={css} />
      </div>
    </div>
  );
}
