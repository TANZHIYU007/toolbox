import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

type Mode = 'json-to-yaml' | 'yaml-to-json';

export default function JsonYamlTool() {
  const [input, setInput] = useToolInput('');
  const [mode, setMode] = useLocalStorage<Mode>('tool:json-yaml:mode', 'json-to-yaml');
  const [indent, setIndent] = useLocalStorage<number>('tool:json-yaml:indent', 2);
  const [result, setResult] = useState({ output: '', error: null as string | null });

  useEffect(() => {
    let cancelled = false;
    if (!input.trim()) {
      setResult({ output: '', error: null });
      return;
    }
    void import('./convert').then(({ jsonToYaml, yamlToJson }) => {
      if (cancelled) return;
      try {
        if (mode === 'json-to-yaml') {
          setResult({ output: jsonToYaml(input, indent), error: null });
        } else {
          setResult({ output: yamlToJson(input, indent), error: null });
        }
      } catch (error) {
        setResult({ output: '', error: error instanceof Error ? error.message : '转换失败' });
      }
    }).catch(() => {
      if (!cancelled) setResult({ output: '', error: 'YAML 解析器加载失败，请刷新后重试' });
    });
    return () => { cancelled = true; };
  }, [input, mode, indent]);

  const switchMode = (next: Mode) => {
    if (result.output) setInput(result.output);
    setMode(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented aria-label="转换方向" value={mode} onChange={switchMode} options={[
          { value: 'json-to-yaml', label: 'JSON → YAML' },
          { value: 'yaml-to-json', label: 'YAML → JSON' },
        ]} />
        <Field label="缩进">
          <Segmented aria-label="缩进宽度" value={String(indent)} onChange={(value) => setIndent(Number(value))} options={[
            { value: '2', label: '2 空格' }, { value: '4', label: '4 空格' },
          ]} />
        </Field>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>清空</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea label={mode === 'json-to-yaml' ? 'JSON 输入' : 'YAML 输入'} value={input} onChange={setInput}
          rows={16} error={result.error} placeholder={mode === 'json-to-yaml' ? '{"name":"toolbox","enabled":true}' : 'name: toolbox\nenabled: true'} />
        <IOArea label={mode === 'json-to-yaml' ? 'YAML 结果' : 'JSON 结果'} value={result.output} rows={16} readOnly />
      </div>
    </div>
  );
}
