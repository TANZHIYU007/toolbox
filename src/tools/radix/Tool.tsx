import { useMemo } from 'react';
import Field from '../../components/ui/Field';
import ResultRow from '../../components/ui/ResultRow';
import Segmented from '../../components/ui/Segmented';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

const PRESETS = [
  { base: 2, label: '二进制', prefix: '0b' },
  { base: 8, label: '八进制', prefix: '0o' },
  { base: 10, label: '十进制', prefix: '' },
  { base: 16, label: '十六进制', prefix: '0x' },
];

/** 用 BigInt 解析，避免大数丢精度 */
function parseBigInt(text: string, base: number): bigint | null {
  const cleaned = text.trim().replace(/[\s_,]/g, '').replace(/^(0x|0b|0o)/i, '');
  if (!cleaned) return null;

  const negative = cleaned.startsWith('-');
  const digits = negative ? cleaned.slice(1) : cleaned;
  if (!digits) return null;

  let value = 0n;
  const big = BigInt(base);
  for (const ch of digits.toLowerCase()) {
    const digit = parseInt(ch, 36);
    if (Number.isNaN(digit) || digit >= base) return null;
    value = value * big + BigInt(digit);
  }
  return negative ? -value : value;
}

export default function RadixTool() {
  const [input, setInput] = useToolInput('');
  const [from, setFrom] = useLocalStorage('tool:radix:from', 10);
  const [custom, setCustom] = useLocalStorage('tool:radix:custom', 36);

  const value = useMemo(() => parseBigInt(input, from), [input, from]);
  const invalid = input.trim().length > 0 && value === null;

  const safeCustom = Math.min(36, Math.max(2, custom));

  return (
    <div className="space-y-5">
      <Field label="输入进制">
        <Segmented
          aria-label="输入进制"
          value={String(from)}
          onChange={(v) => setFrom(Number(v))}
          options={PRESETS.map((p) => ({ value: String(p.base), label: `${p.base} · ${p.label}` }))}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <label htmlFor="radix-input" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          数值
        </label>
        <input
          id="radix-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder={from === 16 ? 'ff00ff 或 0xff00ff' : from === 2 ? '10110101' : '255'}
          className={`h-11 rounded-xl border bg-surface px-3.5 font-mono text-sm transition-colors
                      placeholder:font-sans placeholder:text-fg-subtle/70
                      ${invalid ? 'border-danger' : 'border-border hover:border-fg-subtle/50'}`}
        />
        {invalid && (
          <p className="text-xs text-danger">
            含有 {from} 进制不允许的字符（{from} 进制只能用 {from <= 10 ? `0-${from - 1}` : `0-9 和 a-${String.fromCharCode(96 + from - 10)}`}）
          </p>
        )}
      </div>

      {value !== null && (
        <>
          <div className="space-y-2">
            {PRESETS.map((p) => (
              <ResultRow
                key={p.base}
                label={`${p.label} (${p.base})`}
                value={(value < 0n ? '-' : '') + p.prefix + (value < 0n ? -value : value).toString(p.base)}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <label htmlFor="radix-custom" className="text-xs font-medium text-fg-muted">
              任意进制
            </label>
            <input
              id="radix-custom"
              type="number"
              min={2}
              max={36}
              value={custom}
              onChange={(e) => setCustom(Number(e.target.value))}
              className="h-8 w-16 rounded-lg border border-border bg-surface-2 px-2 text-center font-mono text-sm"
            />
            <code className="min-w-0 flex-1 break-all font-mono text-[13px] text-fg">
              {(value < 0n ? '-' : '') + (value < 0n ? -value : value).toString(safeCustom)}
            </code>
          </div>

          <p className="text-xs text-fg-subtle">
            位数：{(value < 0n ? -value : value).toString(2).length} 位二进制
            {value >= 0n && value < 2n ** 64n && ` · 可用 ${
              value < 2n ** 8n ? 'uint8' : value < 2n ** 16n ? 'uint16' : value < 2n ** 32n ? 'uint32' : 'uint64'
            } 存储`}
          </p>
        </>
      )}
    </div>
  );
}
