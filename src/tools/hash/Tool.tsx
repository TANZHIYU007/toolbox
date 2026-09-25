import { useEffect, useState } from 'react';
import IOArea from '../../components/ui/IOArea';
import ResultRow from '../../components/ui/ResultRow';
import Toggle from '../../components/ui/Toggle';
import { toHex } from '../../lib/codec';
import { useDebounced, useLocalStorage, useToolInput } from '../../lib/hooks';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

export default function HashTool() {
  const [input, setInput] = useToolInput('');
  const [upper, setUpper] = useLocalStorage('tool:hash:upper', false);
  const [digests, setDigests] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // 哈希是异步的，输入防抖一下，避免每敲一个字就算 4 次
  const debounced = useDebounced(input, 180);

  useEffect(() => {
    if (!debounced) {
      setDigests({});
      setError(null);
      return;
    }

    let cancelled = false;
    const bytes = new TextEncoder().encode(debounced);

    Promise.all(
      ALGORITHMS.map(async (algo) => [algo, toHex(await crypto.subtle.digest(algo, bytes))] as const),
    )
      .then((entries) => {
        if (!cancelled) {
          setDigests(Object.fromEntries(entries));
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('当前环境不支持 Web Crypto（需要 HTTPS 或 localhost）');
      });

    // 输入变化很快时，丢弃过期的计算结果，避免旧结果覆盖新结果
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="space-y-5">
      <IOArea
        label="原文"
        value={input}
        onChange={setInput}
        rows={7}
        mono={false}
        error={error}
        placeholder="输入要计算摘要的文本…"
        actions={<Toggle checked={upper} onChange={setUpper} label="大写" />}
      />

      <div className="space-y-2">
        {ALGORITHMS.map((algo) => {
          const value = digests[algo] ?? '';
          return (
            <ResultRow
              key={algo}
              label={algo}
              value={upper ? value.toUpperCase() : value}
              note={value ? `${value.length * 4} 位` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
