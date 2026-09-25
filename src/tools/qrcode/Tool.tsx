import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import IOArea from '../../components/ui/IOArea';
import Segmented from '../../components/ui/Segmented';
import { useDebounced, useLocalStorage, useToolInput } from '../../lib/hooks';

type Level = 'L' | 'M' | 'Q' | 'H';

const SIZES = [256, 512, 1024];

export default function QrcodeTool() {
  const [input, setInput] = useToolInput('');
  const [level, setLevel] = useLocalStorage<Level>('tool:qr:level', 'M');
  const [size, setSize] = useLocalStorage('tool:qr:size', 512);
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounced(input, 250);

  useEffect(() => {
    if (!debounced.trim()) {
      setDataUrl('');
      setError(null);
      return;
    }

    let cancelled = false;

    // 动态 import：qrcode 这个库不小，只有真的用到这个工具时才下载。
    // 首页和其他工具的首屏体积完全不受影响 —— 重依赖都应该这么引。
    import('qrcode')
      .then((mod) =>
        mod.default.toDataURL(debounced, {
          errorCorrectionLevel: level,
          width: size,
          margin: 2,
          color: { dark: '#000000ff', light: '#ffffffff' },
        }),
      )
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setError('内容太长，超出了二维码容量上限');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, level, size]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${size}.png`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <IOArea
        label="内容"
        value={input}
        onChange={setInput}
        rows={4}
        mono={false}
        error={error}
        placeholder="https://tanzhiyu007.github.io/toolbox/ 或任意文本"
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Field label="容错等级" hint={{ L: '约 7%', M: '约 15%', Q: '约 25%', H: '约 30%' }[level]}>
          <Segmented
            aria-label="容错等级"
            value={level}
            onChange={setLevel}
            options={[
              { value: 'L', label: 'L' },
              { value: 'M', label: 'M' },
              { value: 'Q', label: 'Q' },
              { value: 'H', label: 'H' },
            ]}
          />
        </Field>
        <Field label="尺寸">
          <Segmented
            aria-label="图片尺寸"
            value={String(size)}
            onChange={(v) => setSize(Number(v))}
            options={SIZES.map((s) => ({ value: String(s), label: `${s}px` }))}
          />
        </Field>
      </div>

      {dataUrl && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6">
          <img
            src={dataUrl}
            alt="生成的二维码"
            width={240}
            height={240}
            className="rounded-lg bg-white"
          />
          <Button variant="primary" onClick={download}>
            <Download size={15} />
            下载 PNG（{size}px）
          </Button>
        </div>
      )}
    </div>
  );
}
