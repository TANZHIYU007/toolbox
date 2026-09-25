import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import CopyButton from '../../components/ui/CopyButton';
import Field from '../../components/ui/Field';
import Toggle from '../../components/ui/Toggle';
import { cn } from '../../lib/cn';
import { useLocalStorage } from '../../lib/hooks';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
};

const AMBIGUOUS = /[0O1lI|`'"~]/g;

/**
 * 从字符集里等概率取一个字符。
 * 用拒绝采样而不是 % 取模：取模会让排在前面的字符概率偏高，实际熵低于标称值。
 */
function pick(charset: string): string {
  const limit = Math.floor(256 / charset.length) * charset.length;
  const buffer = new Uint8Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);
  return charset[value % charset.length]!;
}

export default function PasswordTool() {
  const [length, setLength] = useLocalStorage('tool:pwd:length', 20);
  const [useLower, setUseLower] = useLocalStorage('tool:pwd:lower', true);
  const [useUpper, setUseUpper] = useLocalStorage('tool:pwd:upper', true);
  const [useDigits, setUseDigits] = useLocalStorage('tool:pwd:digits', true);
  const [useSymbols, setUseSymbols] = useLocalStorage('tool:pwd:symbols', true);
  const [noAmbiguous, setNoAmbiguous] = useLocalStorage('tool:pwd:clear', false);
  const [count, setCount] = useLocalStorage('tool:pwd:count', 3);
  const [passwords, setPasswords] = useState<string[]>([]);

  let charset =
    (useLower ? SETS.lower : '') +
    (useUpper ? SETS.upper : '') +
    (useDigits ? SETS.digits : '') +
    (useSymbols ? SETS.symbols : '');
  if (noAmbiguous) charset = charset.replace(AMBIGUOUS, '');

  const generate = useCallback(() => {
    if (!charset) {
      setPasswords([]);
      return;
    }
    setPasswords(
      Array.from({ length: count }, () =>
        Array.from({ length }, () => pick(charset)).join(''),
      ),
    );
  }, [charset, length, count]);

  useEffect(() => {
    generate();
  }, [generate]);

  const entropy = charset ? Math.round(length * Math.log2(charset.length)) : 0;
  const level =
    entropy >= 100 ? { text: '很强', color: 'text-success', bar: 'bg-success', pct: 100 } :
    entropy >= 80 ? { text: '强', color: 'text-success', bar: 'bg-success', pct: 80 } :
    entropy >= 60 ? { text: '中等', color: 'text-warning', bar: 'bg-warning', pct: 55 } :
    { text: '偏弱', color: 'text-danger', bar: 'bg-danger', pct: 28 };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="pwd-length" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            长度
          </label>
          <span className="font-mono text-sm tabular-nums text-fg">{length}</span>
        </div>
        <input
          id="pwd-length"
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--brand)]"
        />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <Toggle checked={useLower} onChange={setUseLower} label="小写 a-z" />
        <Toggle checked={useUpper} onChange={setUseUpper} label="大写 A-Z" />
        <Toggle checked={useDigits} onChange={setUseDigits} label="数字 0-9" />
        <Toggle checked={useSymbols} onChange={setUseSymbols} label="符号 !@#" />
        <Toggle checked={noAmbiguous} onChange={setNoAmbiguous} label="排除易混字符" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Field label="数量">
          <div className="flex gap-1">
            {[1, 3, 5, 10].map((n) => (
              <Button key={n} size="sm" variant={n === count ? 'primary' : 'secondary'} onClick={() => setCount(n)}>
                {n}
              </Button>
            ))}
          </div>
        </Field>
        <div className="flex-1" />
        <Button variant="primary" onClick={generate} disabled={!charset}>
          <RefreshCw size={14} />
          重新生成
        </Button>
      </div>

      {!charset ? (
        <p className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          至少要选一种字符集
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {passwords.map((pwd, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 rounded-lg border border-border-soft bg-surface px-3.5 py-3"
              >
                <code className="min-w-0 flex-1 break-all font-mono text-sm text-fg select-all">{pwd}</code>
                <CopyButton value={pwd} className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fg-muted">
                强度：<span className={cn('font-medium', level.color)}>{level.text}</span>
              </span>
              <span className="font-mono text-fg-subtle">
                {entropy} bit · 字符集 {charset.length} 个
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className={cn('h-full rounded-full transition-all duration-300', level.bar)} style={{ width: `${level.pct}%` }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
