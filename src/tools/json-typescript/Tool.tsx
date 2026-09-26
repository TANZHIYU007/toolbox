import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import Toggle from '../../components/ui/Toggle';
import { useLocalStorage, useToolInput } from '../../lib/hooks';
import { jsonToTypeScript, type DeclarationStyle } from './generate';

export default function JsonTypescriptTool() {
  const [input, setInput] = useToolInput('');
  const [style, setStyle] = useLocalStorage<DeclarationStyle>('tool:json-ts:style', 'interface');
  const [readonly, setReadonly] = useLocalStorage('tool:json-ts:readonly', false);
  const [rootName, setRootName] = useLocalStorage('tool:json-ts:root', 'Root');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null };
    try {
      return { output: jsonToTypeScript(JSON.parse(input), { rootName, style, readonly }), error: null };
    } catch (error) {
      return { output: '', error: error instanceof Error ? error.message : 'JSON 解析失败' };
    }
  }, [input, rootName, style, readonly]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented aria-label="声明风格" value={style} onChange={setStyle} options={[
          { value: 'interface', label: 'interface' }, { value: 'type', label: 'type' },
        ]} />
        <Field label="根类型名">
          <input value={rootName} onChange={(event) => setRootName(event.target.value)} aria-label="根类型名"
            className="h-9 w-32 rounded-lg border border-border bg-surface px-3 font-mono text-sm" />
        </Field>
        <Toggle checked={readonly} onChange={setReadonly} label="readonly" />
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>清空</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea label="JSON 输入" value={input} onChange={setInput} rows={18} error={result.error}
          placeholder={'{"id":1,"name":"Alice","tags":["admin"],"profile":{"active":true}}'} />
        <IOArea label="TypeScript 结果" value={result.output} rows={18} readOnly />
      </div>
    </div>
  );
}
