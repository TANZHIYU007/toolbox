import { useEffect, useState } from 'react';
import IOArea from '../../components/ui/IOArea';
import Field from '../../components/ui/Field';
import ResultRow from '../../components/ui/ResultRow';
import Segmented from '../../components/ui/Segmented';
import { Eye, EyeOff } from 'lucide-react';
import { toHex } from '../../lib/codec';
import { useDebounced, useLocalStorage, useToolInput } from '../../lib/hooks';

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

function toBase64(buffer: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export default function HmacTool() {
  const [message, setMessage] = useToolInput('');
  const [secret, setSecret] = useState('');
  const [algo, setAlgo] = useLocalStorage<Algo>('tool:hmac:algo', 'SHA-256');
  const [reveal, setReveal] = useState(false);
  const [result, setResult] = useState<{ hex: string; base64: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedMessage = useDebounced(message, 200);
  const debouncedSecret = useDebounced(secret, 200);

  useEffect(() => {
    if (!debouncedMessage || !debouncedSecret) {
      setResult(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const encoder = new TextEncoder();

    crypto.subtle
      .importKey('raw', encoder.encode(debouncedSecret), { name: 'HMAC', hash: algo }, false, ['sign'])
      .then((key) => crypto.subtle.sign('HMAC', key, encoder.encode(debouncedMessage)))
      .then((signature) => {
        if (!cancelled) {
          setResult({ hex: toHex(signature), base64: toBase64(signature) });
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('签名失败（需要 HTTPS 或 localhost 环境）');
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedMessage, debouncedSecret, algo]);

  return (
    <div className="space-y-5">
      <Field label="算法">
        <Segmented
          aria-label="哈希算法"
          value={algo}
          onChange={setAlgo}
          options={(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as Algo[]).map((a) => ({
            value: a,
            label: a.replace('SHA-', 'SHA'),
          }))}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="hmac-secret" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            密钥 secret
          </label>
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-subtle
                       transition-colors hover:bg-surface-2 hover:text-fg"
          >
            {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
            {reveal ? '隐藏' : '显示'}
          </button>
        </div>
        <input
          id="hmac-secret"
          type={reveal ? 'text' : 'password'}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="用于签名的共享密钥"
          className="h-11 rounded-xl border border-border bg-surface px-3.5 font-mono text-sm
                     transition-colors placeholder:font-sans placeholder:text-fg-subtle/70
                     hover:border-fg-subtle/50"
        />
      </div>

      <IOArea
        label="消息"
        value={message}
        onChange={setMessage}
        rows={6}
        mono={false}
        error={error}
        placeholder="要签名的消息内容…"
      />

      <div className="space-y-2">
        <ResultRow label="Hex" value={result?.hex ?? ''} note={result ? '小写十六进制' : undefined} />
        <ResultRow label="Base64" value={result?.base64 ?? ''} />
      </div>

      <p className="rounded-xl border border-warning/30 bg-surface px-4 py-3 text-xs leading-relaxed text-fg-muted">
        <span className="font-medium text-warning">提醒：</span>
        本页的计算完全在你的浏览器里完成，密钥不会离开本机。
        但仍建议只用测试密钥 —— 生产密钥不贴进任何网页工具，是个值得保持的习惯。
      </p>
    </div>
  );
}
