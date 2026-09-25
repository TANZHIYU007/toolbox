import { useMemo } from 'react';
import Field from '../../components/ui/Field';
import Panel from '../../components/ui/Panel';
import Toggle from '../../components/ui/Toggle';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

interface MatchInfo {
  index: number;
  text: string;
  groups: (string | undefined)[];
  named: Record<string, string> | undefined;
}

const CHEATSHEET: [string, string][] = [
  ['\\d', '数字'], ['\\w', '字母数字下划线'], ['\\s', '空白字符'],
  ['[abc]', '任一字符'], ['[^abc]', '除此之外'], ['a|b', '或'],
  ['a*', '0 次或多次'], ['a+', '1 次或多次'], ['a?', '0 次或 1 次'],
  ['a{2,4}', '2 到 4 次'], ['(...)', '捕获分组'], ['(?:...)', '非捕获分组'],
  ['^', '行首'], ['$', '行尾'], ['\\b', '单词边界'],
];

export default function RegexTool() {
  const [text, setText] = useToolInput('');
  const [pattern, setPattern] = useLocalStorage('tool:regex:pattern', '');
  const [global, setGlobal] = useLocalStorage('tool:regex:g', true);
  const [ignoreCase, setIgnoreCase] = useLocalStorage('tool:regex:i', false);
  const [multiline, setMultiline] = useLocalStorage('tool:regex:m', false);
  const [dotAll, setDotAll] = useLocalStorage('tool:regex:s', false);

  const flags = `${global ? 'g' : ''}${ignoreCase ? 'i' : ''}${multiline ? 'm' : ''}${dotAll ? 's' : ''}`;

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: null as string | null };

    let re: RegExp;
    try {
      re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    } catch (err) {
      return { matches: [], error: err instanceof Error ? err.message : '正则语法错误' };
    }

    const found: MatchInfo[] = [];
    for (const m of text.matchAll(re)) {
      found.push({
        index: m.index ?? 0,
        text: m[0],
        groups: m.slice(1),
        named: m.groups,
      });
      // 非全局模式只取第一个；空匹配也要防止死循环
      if (!global || m[0] === '') break;
      if (found.length > 500) break;
    }
    return { matches: found, error: null };
  }, [text, pattern, flags, global]);

  // 把原文按匹配位置切成「普通段 / 高亮段」交替的数组
  const segments = useMemo(() => {
    if (matches.length === 0) return [{ text, hit: false }];
    const out: { text: string; hit: boolean }[] = [];
    let cursor = 0;
    for (const m of matches) {
      if (m.index > cursor) out.push({ text: text.slice(cursor, m.index), hit: false });
      out.push({ text: m.text, hit: true });
      cursor = m.index + m.text.length;
    }
    if (cursor < text.length) out.push({ text: text.slice(cursor), hit: false });
    return out;
  }, [text, matches]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="re-pattern" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          正则表达式
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 focus-within:border-brand">
          <span className="font-mono text-sm text-fg-subtle">/</span>
          <input
            id="re-pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            placeholder="\\d{4}-\\d{2}-\\d{2}"
            className="h-11 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-fg-subtle/70"
          />
          <span className="font-mono text-sm text-fg-subtle">/{flags}</span>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <Field label="标志">
        <div className="flex flex-wrap gap-4">
          <Toggle checked={global} onChange={setGlobal} label="g 全局" />
          <Toggle checked={ignoreCase} onChange={setIgnoreCase} label="i 忽略大小写" />
          <Toggle checked={multiline} onChange={setMultiline} label="m 多行" />
          <Toggle checked={dotAll} onChange={setDotAll} label="s 点匹配换行" />
        </div>
      </Field>

      <div className="flex flex-col gap-2">
        <label htmlFor="re-text" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          测试文本
        </label>
        <textarea
          id="re-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder="把要匹配的文本粘进来…"
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-3 font-mono
                     text-[13px] leading-relaxed scrollbar-thin transition-colors
                     placeholder:font-sans placeholder:text-fg-subtle/70 hover:border-fg-subtle/50"
        />
      </div>

      {text && pattern && !error && (
        <Panel title={`匹配结果（${matches.length} 处）`}>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-2 p-3 font-mono text-[13px] leading-relaxed scrollbar-thin">
            {segments.map((seg, i) =>
              seg.hit ? (
                <mark key={i} className="rounded bg-brand-soft px-0.5 text-brand">{seg.text}</mark>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </pre>

          {matches.length > 0 && (
            <ul className="mt-3 max-h-56 space-y-1.5 overflow-auto scrollbar-thin">
              {matches.slice(0, 50).map((m, i) => (
                <li key={i} className="rounded-lg border border-border-soft bg-surface px-3 py-2 text-[13px]">
                  <span className="mr-2 font-mono text-xs text-fg-subtle">#{i + 1} @{m.index}</span>
                  <code className="font-mono text-fg">{m.text || '(空匹配)'}</code>
                  {m.groups.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
                      {m.groups.map((g, gi) => (
                        <span key={gi}>
                          <span className="text-fg-subtle">${gi + 1}</span> = <code className="font-mono">{g ?? '—'}</code>
                        </span>
                      ))}
                      {m.named && Object.entries(m.named).map(([name, value]) => (
                        <span key={name}>
                          <span className="text-fg-subtle">{name}</span> = <code className="font-mono">{value}</code>
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <Panel title="速查">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {CHEATSHEET.map(([syntax, desc]) => (
            <div key={syntax} className="flex items-baseline gap-2 text-xs">
              <code className="font-mono text-brand">{syntax}</code>
              <span className="text-fg-muted">{desc}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
