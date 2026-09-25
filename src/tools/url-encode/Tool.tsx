import { useMemo } from 'react';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import Segmented from '../../components/ui/Segmented';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

type Mode = 'encode' | 'decode';
type Scope = 'component' | 'full';

/** 输入看起来是个带查询串的 URL 时，顺手把参数拆成表格 */
function parseQuery(text: string): { key: string; value: string }[] | null {
  const trimmed = text.trim();
  if (!trimmed.includes('=')) return null;

  const queryPart = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : trimmed;
  if (!queryPart.includes('=')) return null;

  try {
    const params = new URLSearchParams(queryPart);
    const rows = [...params.entries()].map(([key, value]) => ({ key, value }));
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

export default function UrlEncodeTool() {
  const [input, setInput] = useToolInput('');
  const [mode, setMode] = useLocalStorage<Mode>('tool:url:mode', 'encode');
  const [scope, setScope] = useLocalStorage<Scope>('tool:url:scope', 'component');

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null };
    try {
      if (mode === 'encode') {
        return {
          output: scope === 'component' ? encodeURIComponent(input) : encodeURI(input),
          error: null,
        };
      }
      return {
        output: scope === 'component' ? decodeURIComponent(input) : decodeURI(input),
        error: null,
      };
    } catch {
      return { output: '', error: '存在不合法的百分号转义序列（比如落单的 %）' };
    }
  }, [input, mode, scope]);

  const params = useMemo(() => parseQuery(mode === 'decode' ? output || input : input), [mode, input, output]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          aria-label="转换方向"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: '编码' },
            { value: 'decode', label: '解码' },
          ]}
        />
        <Field label="范围" hint={scope === 'component' ? '转义 & = ? / 等分隔符' : '保留 URL 结构字符'}>
          <Segmented
            aria-label="编码范围"
            value={scope}
            onChange={setScope}
            options={[
              { value: 'component', label: '参数值' },
              { value: 'full', label: '整条 URL' },
            ]}
          />
        </Field>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          清空
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea
          label="输入"
          value={input}
          onChange={setInput}
          rows={8}
          error={error}
          placeholder="https://example.com/搜索?q=工具箱&page=2"
        />
        <IOArea label="结果" value={output} rows={8} readOnly />
      </div>

      {params && (
        <Panel title={`查询参数（${params.length} 个）`}>
          <div className="space-y-2">
            {params.map((p, i) => (
              <ResultRow key={`${p.key}-${i}`} label={p.key} value={p.value} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
