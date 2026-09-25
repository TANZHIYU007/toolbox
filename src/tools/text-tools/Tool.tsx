import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';
import { useToolInput } from '../../lib/hooks';

type Operation = { label: string; run: (text: string) => string };

const collator = new Intl.Collator('zh-Hans-CN', { numeric: true, sensitivity: 'base' });

const GROUPS: { title: string; items: Operation[] }[] = [
  {
    title: '行操作',
    items: [
      { label: '去除重复行', run: (t) => [...new Set(t.split('\n'))].join('\n') },
      { label: '去除空行', run: (t) => t.split('\n').filter((l) => l.trim()).join('\n') },
      { label: '正序排序', run: (t) => t.split('\n').sort(collator.compare).join('\n') },
      { label: '倒序排序', run: (t) => t.split('\n').sort((a, b) => collator.compare(b, a)).join('\n') },
      { label: '反转行序', run: (t) => t.split('\n').reverse().join('\n') },
      { label: '打乱行序', run: (t) => {
        const lines = t.split('\n');
        for (let i = lines.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j]!, lines[i]!];
        }
        return lines.join('\n');
      } },
      { label: '添加行号', run: (t) => {
        const lines = t.split('\n');
        const width = String(lines.length).length;
        return lines.map((l, i) => `${String(i + 1).padStart(width, ' ')}. ${l}`).join('\n');
      } },
      { label: '去除行号', run: (t) => t.split('\n').map((l) => l.replace(/^\s*\d+[.)\]:\s]\s*/, '')).join('\n') },
    ],
  },
  {
    title: '空白',
    items: [
      { label: '去首尾空格', run: (t) => t.split('\n').map((l) => l.trim()).join('\n') },
      { label: '压缩连续空格', run: (t) => t.replace(/[ \t]+/g, ' ') },
      { label: '合并连续空行', run: (t) => t.replace(/\n{3,}/g, '\n\n') },
      { label: '删除所有空白', run: (t) => t.replace(/\s+/g, '') },
    ],
  },
  {
    title: '大小写',
    items: [
      { label: '全部大写', run: (t) => t.toUpperCase() },
      { label: '全部小写', run: (t) => t.toLowerCase() },
      { label: '首字母大写', run: (t) => t.replace(/\b\w/g, (c) => c.toUpperCase()) },
      { label: '大小写互换', run: (t) => t.replace(/[a-zA-Z]/g, (c) =>
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) },
    ],
  },
];

export default function TextToolsTool() {
  const [text, setText] = useToolInput('');
  const [history, setHistory] = useState<string[]>([]);

  const apply = (op: Operation) => {
    setHistory((h) => [...h, text]);
    setText(op.run(text));
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (previous === undefined) return;
    setHistory((h) => h.slice(0, -1));
    setText(previous);
  };

  const stats = useMemo(() => {
    const lines = text === '' ? 0 : text.split('\n').length;
    const chars = text.length;
    const noSpace = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const cjk = (text.match(/[一-鿿]/g) ?? []).length;
    return { lines, chars, noSpace, words, cjk };
  }, [text]);

  return (
    <div className="space-y-5">
      <IOArea
        label="文本"
        value={text}
        onChange={setText}
        rows={12}
        mono={false}
        placeholder="粘贴要处理的文本，然后点下面的按钮，操作可以叠加…"
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={undo} disabled={history.length === 0}>
              撤销{history.length > 0 && ` (${history.length})`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setHistory([]); setText(''); }} disabled={!text}>
              清空
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {GROUPS.map((group) => (
          <Panel key={group.title} title={group.title}>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((op) => (
                <Button key={op.label} size="sm" onClick={() => apply(op)} disabled={!text}>
                  {op.label}
                </Button>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="统计">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['字符数', stats.chars],
            ['不含空白', stats.noSpace],
            ['词数', stats.words],
            ['行数', stats.lines],
            ['中文字数', stats.cjk],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg bg-surface-2 px-3 py-2">
              <p className="text-xs text-fg-subtle">{label}</p>
              <p className="mt-0.5 font-mono text-sm tabular-nums text-fg">{value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
