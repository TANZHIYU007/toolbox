import { useMemo } from 'react';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import { useToolInput } from '../../lib/hooks';
import { contrastRatio, luminance, parseColor, rgbToHex, rgbToHsl } from './parse';

const SWATCHES = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#1f2937'];

export default function ColorTool() {
  const [input, setInput] = useToolInput('#6366f1');
  const rgb = useMemo(() => parseColor(input), [input]);

  const derived = useMemo(() => {
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb);
    const lum = luminance(rgb);
    return {
      hex: rgbToHex(rgb),
      rgbText: rgb.a < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a.toFixed(2)})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hslText: rgb.a < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${rgb.a.toFixed(2)})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      cssVar: `--color: ${rgbToHex(rgb)};`,
      onWhite: contrastRatio(lum, 1),
      onBlack: contrastRatio(lum, 0),
      preferDark: lum > 0.4,
    };
  }, [rgb]);

  const invalid = input.trim().length > 0 && rgb === null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-1 flex-col gap-2">
          <label htmlFor="color-input" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            颜色值
          </label>
          <input
            id="color-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="#6366f1 / rgb(99,102,241) / hsl(239,84%,67%)"
            className={`h-11 rounded-xl border bg-surface px-3.5 font-mono text-sm transition-colors
                        placeholder:font-sans placeholder:text-fg-subtle/70
                        ${invalid ? 'border-danger' : 'border-border hover:border-fg-subtle/50'}`}
          />
        </div>

        <input
          type="color"
          aria-label="取色器"
          value={derived ? derived.hex.slice(0, 7) : '#000000'}
          onChange={(e) => setInput(e.target.value)}
          className="size-11 cursor-pointer rounded-xl border border-border bg-surface p-1"
        />
      </div>

      {invalid && <p className="text-xs text-danger">无法解析这个颜色值</p>}

      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => setInput(hex)}
            aria-label={`使用 ${hex}`}
            title={hex}
            className="size-7 rounded-lg border border-border/60 transition-transform hover:scale-110"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      {derived && (
        <>
          <div
            className="flex h-28 items-center justify-center rounded-xl border border-border font-mono text-sm"
            style={{
              backgroundColor: derived.hex,
              color: derived.preferDark ? '#111827' : '#ffffff',
            }}
          >
            {derived.hex}
          </div>

          <div className="space-y-2">
            <ResultRow label="HEX" value={derived.hex} />
            <ResultRow label="RGB" value={derived.rgbText} />
            <ResultRow label="HSL" value={derived.hslText} />
            <ResultRow label="CSS 变量" value={derived.cssVar} />
          </div>

          <Panel title="文字对比度（WCAG）">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: '白色文字', ratio: derived.onWhite },
                { label: '黑色文字', ratio: derived.onBlack },
              ].map(({ label, ratio }) => {
                const pass = ratio >= 4.5;
                return (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                    <span className="text-xs text-fg-muted">{label}</span>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-fg">{ratio.toFixed(2)}:1</span>
                      <span className={pass ? 'text-success' : 'text-warning'}>
                        {pass ? 'AA 通过' : '偏低'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
