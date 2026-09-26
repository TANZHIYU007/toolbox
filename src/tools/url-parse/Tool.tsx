import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import { useToolInput } from '../../lib/hooks';
import { parseUrl } from './parse';

export default function UrlParseTool() {
  const [input, setInput] = useToolInput('');
  const { data, error } = useMemo(() => parseUrl(input), [input]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>清空</Button>
      </div>
      <IOArea
        label="完整 URL"
        value={input}
        onChange={setInput}
        rows={4}
        error={error}
        placeholder="https://user:pass@example.com:8080/docs/page?q=工具箱&tag=web#intro"
      />
      {data && (
        <>
          <Panel title="URL 结构">
            <div className="space-y-2">
              {data.fields.map((field) => <ResultRow key={field.label} label={field.label} value={field.value} />)}
            </div>
          </Panel>
          <Panel title={`查询参数（${data.params.length} 个）`}>
            {data.params.length > 0 ? (
              <div className="space-y-2">
                {data.params.map((param, index) => (
                  <ResultRow key={`${param.key}-${index}`} label={param.key || '（空键名）'} value={param.value} />
                ))}
              </div>
            ) : <p className="text-sm text-fg-subtle">这个 URL 没有查询参数。</p>}
          </Panel>
        </>
      )}
    </div>
  );
}
