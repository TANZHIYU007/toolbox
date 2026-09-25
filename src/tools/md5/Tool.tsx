import { useMemo } from 'react';
import IOArea from '../../components/ui/IOArea';
import ResultRow from '../../components/ui/ResultRow';
import Toggle from '../../components/ui/Toggle';
import { useLocalStorage, useToolInput } from '../../lib/hooks';
import { md5 } from './md5';

export default function Md5Tool() {
  const [input, setInput] = useToolInput('');
  const [upper, setUpper] = useLocalStorage('tool:md5:upper', false);

  const digest = useMemo(() => (input ? md5(input) : ''), [input]);
  const cased = (value: string) => (upper ? value.toUpperCase() : value);

  return (
    <div className="space-y-5">
      <IOArea
        label="原文"
        value={input}
        onChange={setInput}
        rows={7}
        mono={false}
        placeholder="输入要计算 MD5 的文本…"
        actions={<Toggle checked={upper} onChange={setUpper} label="大写" />}
      />

      <div className="space-y-2">
        <ResultRow label="MD5 (32 位)" value={cased(digest)} note={digest ? '128 位' : undefined} />
        <ResultRow
          label="MD5 (16 位)"
          value={cased(digest.slice(8, 24))}
          note={digest ? '取中间 16 字符' : undefined}
        />
      </div>

      <p className="rounded-xl border border-warning/30 bg-surface px-4 py-3 text-xs leading-relaxed text-fg-muted">
        <span className="font-medium text-warning">注意：</span>
        MD5 已被证明可构造碰撞，只适合做文件完整性校验和兼容老系统的签名。
        密码存储请使用 bcrypt 或 Argon2，数字签名请使用 SHA-256 及以上。
      </p>
    </div>
  );
}
