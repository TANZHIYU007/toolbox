import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

type Mode = 'pretty' | 'minify';

/** 把 JSON.parse 的报错翻译成「第几行第几列」 */
function describeError(err: unknown, source: string): string {
  const message = err instanceof Error ? err.message : String(err);
  const at = /position (\d+)/.exec(message);
  if (!at) return message;

  const position = Number(at[1]);
  const before = source.slice(0, position);
  const line = before.split('\n').length;
  const column = position - before.lastIndexOf('\n');
  return `${message}（第 ${line} 行，第 ${column} 列）`;
}

export default function JsonFormatTool() {
  const [input, setInput] = useToolInput('');
  const [mode, setMode] = useLocalStorage<Mode>('tool:json:mode', 'pretty');
  const [indent, setIndent] = useLocalStorage<number>('tool:json:indent', 2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null };
    try {
      const parsed: unknown = JSON.parse(input);
      return {
        output: mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent),
        error: null,
      };
    } catch (err) {
      return { output: '', error: describeError(err, input) };
    }
  }, [input, mode, indent]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          aria-label="输出模式"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'pretty', label: '格式化' },
            { value: 'minify', label: '压缩' },
          ]}
        />

        {mode === 'pretty' && (
          <Field label="缩进">
            <Segmented
              aria-label="缩进宽度"
              value={String(indent)}
              onChange={(v) => setIndent(Number(v))}
              options={[
                { value: '2', label: '2 空格' },
                { value: '4', label: '4 空格' },
              ]}
            />
          </Field>
        )}

        <div className="flex-1" />

        <Button size="sm" onClick={() => setInput('')} disabled={!input}>
          清空
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea
          label="输入"
          value={input}
          onChange={setInput}
          rows={16}
          error={error}
          placeholder={'{"hello":"world","list":[1,2,3]}'}
        />
        <IOArea label="结果" value={output} rows={16} readOnly />
      </div>
    </div>
  );
}
