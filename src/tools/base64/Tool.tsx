import { useMemo } from 'react';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import { base64ToUtf8, utf8ToBase64 } from '../../lib/codec';
import { useLocalStorage, useToolInput } from '../../lib/hooks';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [input, setInput] = useToolInput('');
  const [mode, setMode] = useLocalStorage<Mode>('tool:base64:mode', 'encode');
  const [urlSafe, setUrlSafe] = useLocalStorage('tool:base64:urlsafe', false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null };
    try {
      return {
        output: mode === 'encode' ? utf8ToBase64(input, urlSafe) : base64ToUtf8(input),
        error: null,
      };
    } catch {
      return {
        output: '',
        error: mode === 'decode' ? '不是合法的 Base64 字符串' : '编码失败',
      };
    }
  }, [input, mode, urlSafe]);

  // 把结果换到输入框，方便连续操作（编码完想再解回来验证）
  const swap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

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
        {mode === 'encode' && (
          <Toggle checked={urlSafe} onChange={setUrlSafe} label="URL 安全字符集" />
        )}
        <div className="flex-1" />
        <Button size="sm" onClick={swap} disabled={!output}>
          结果换到输入
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
          清空
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <IOArea
          label={mode === 'encode' ? '原文' : 'Base64'}
          value={input}
          onChange={setInput}
          rows={12}
          error={error}
          mono={mode === 'decode'}
          placeholder={mode === 'encode' ? '你好，工具箱！' : '5L2g5aW977yM5bel5YW3566xIQ=='}
        />
        <IOArea
          label={mode === 'encode' ? 'Base64' : '原文'}
          value={output}
          rows={12}
          readOnly
          mono={mode === 'encode'}
        />
      </div>
    </div>
  );
}
