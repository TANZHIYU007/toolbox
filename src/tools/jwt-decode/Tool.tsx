import { useMemo } from 'react';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import Button from '../../components/ui/Button';
import { base64ToUtf8 } from '../../lib/codec';
import { useToolInput } from '../../lib/hooks';

interface Decoded {
  header: string;
  payload: string;
  signature: string;
  claims: Record<string, unknown>;
}

function decode(raw: string): { data: Decoded | null; error: string | null } {
  const text = raw.trim().replace(/^Bearer\s+/i, '');
  if (!text) return { data: null, error: null };

  const parts = text.split('.');
  if (parts.length !== 3) {
    return { data: null, error: `JWT 应该是三段用点号分隔的结构，这里有 ${parts.length} 段` };
  }

  try {
    const header = JSON.parse(base64ToUtf8(parts[0]!)) as Record<string, unknown>;
    const claims = JSON.parse(base64ToUtf8(parts[1]!)) as Record<string, unknown>;
    return {
      data: {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(claims, null, 2),
        signature: parts[2]!,
        claims,
      },
      error: null,
    };
  } catch {
    return { data: null, error: '头部或载荷不是合法的 Base64URL 编码的 JSON' };
  }
}

const TIME_CLAIMS: Record<string, string> = {
  exp: '过期时间 exp',
  iat: '签发时间 iat',
  nbf: '生效时间 nbf',
};

function formatClaimTime(seconds: number): { value: string; note: string } {
  const date = new Date(seconds * 1000);
  const diff = date.getTime() - Date.now();
  const hours = Math.abs(diff) / 3_600_000;
  const rel = hours < 48 ? `${hours.toFixed(1)} 小时` : `${(hours / 24).toFixed(1)} 天`;
  return {
    value: date.toLocaleString('zh-CN'),
    note: diff >= 0 ? `${rel}后` : `${rel}前`,
  };
}

export default function JwtDecodeTool() {
  const [input, setInput] = useToolInput('');
  const { data, error } = useMemo(() => decode(input), [input]);

  const exp = typeof data?.claims.exp === 'number' ? data.claims.exp : null;
  const expired = exp !== null && exp * 1000 < Date.now();

  return (
    <div className="space-y-5">
      <IOArea
        label="JWT"
        value={input}
        onChange={setInput}
        rows={5}
        error={error}
        placeholder="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature"
        actions={
          <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
            清空
          </Button>
        }
      />

      {data && (
        <>
          {exp !== null && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                expired
                  ? 'border-danger/40 bg-danger-soft text-danger'
                  : 'border-border bg-surface text-fg-muted'
              }`}
            >
              {expired ? '⚠ 这个 token 已经过期' : '✓ token 尚在有效期内'}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <IOArea label="头部 header" value={data.header} rows={8} readOnly />
            <IOArea label="载荷 payload" value={data.payload} rows={8} readOnly />
          </div>

          <Panel title="关键声明">
            <div className="space-y-2">
              {Object.entries(TIME_CLAIMS).map(([key, label]) => {
                const value = data.claims[key];
                if (typeof value !== 'number') return null;
                const { value: text, note } = formatClaimTime(value);
                return <ResultRow key={key} label={label} value={text} note={note} />;
              })}
              {typeof data.claims.sub === 'string' && (
                <ResultRow label="主体 sub" value={data.claims.sub} />
              )}
              {typeof data.claims.iss === 'string' && (
                <ResultRow label="签发者 iss" value={data.claims.iss} />
              )}
              <ResultRow label="签名" value={data.signature} note="未校验" />
            </div>
          </Panel>

          <p className="text-xs leading-relaxed text-fg-subtle">
            签名校验需要服务端密钥，不应该贴进任何网页工具，因此这里只做解码。
          </p>
        </>
      )}
    </div>
  );
}
