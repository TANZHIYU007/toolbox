import { useMemo } from 'react';
import IOArea from '../../components/ui/IOArea';
import ResultRow from '../../components/ui/ResultRow';
import { useToolInput } from '../../lib/hooks';

/**
 * 把任意写法切成单词数组，这是所有转换的基础。
 * 难点是连续大写：HTTPResponse 要切成 ['HTTP', 'Response'] 而不是 ['H','T','T','P','Response']。
 */
function toWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')       // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')    // HTTPResponse → HTTP Response
    .replace(/[_\-.]+/g, ' ')                      // 下划线 / 短横线 / 点 → 空格
    .split(/\s+/)
    .filter(Boolean);
}

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export default function CaseConvertTool() {
  const [input, setInput] = useToolInput('');

  const results = useMemo(() => {
    const words = toWords(input);
    if (words.length === 0) return null;

    const lower = words.map((w) => w.toLowerCase());
    return {
      camel: lower[0] + words.slice(1).map(upperFirst).join(''),
      pascal: words.map(upperFirst).join(''),
      snake: lower.join('_'),
      screaming: lower.join('_').toUpperCase(),
      kebab: lower.join('-'),
      dot: lower.join('.'),
      space: lower.join(' '),
      title: words.map(upperFirst).join(' '),
      path: lower.join('/'),
    };
  }, [input]);

  return (
    <div className="space-y-5">
      <IOArea
        label="输入"
        value={input}
        onChange={setInput}
        rows={3}
        mono={false}
        placeholder="userProfileSettings 或 user_profile_settings 或 User Profile Settings"
      />

      {results && (
        <div className="space-y-2">
          <ResultRow label="camelCase" value={results.camel} note="JS 变量" />
          <ResultRow label="PascalCase" value={results.pascal} note="类名 / 组件名" />
          <ResultRow label="snake_case" value={results.snake} note="Python / 数据库" />
          <ResultRow label="SCREAMING" value={results.screaming} note="常量" />
          <ResultRow label="kebab-case" value={results.kebab} note="CSS / URL" />
          <ResultRow label="dot.case" value={results.dot} note="配置键" />
          <ResultRow label="空格分隔" value={results.space} />
          <ResultRow label="Title Case" value={results.title} note="标题" />
          <ResultRow label="path/case" value={results.path} note="路径" />
        </div>
      )}
    </div>
  );
}
