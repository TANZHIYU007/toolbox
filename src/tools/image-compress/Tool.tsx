import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import FileDrop from '../../components/ui/FileDrop';
import Panel from '../../components/ui/Panel';
import Segmented from '../../components/ui/Segmented';
import { formatBytes, percentChange } from '../../lib/format';
import { cn } from '../../lib/cn';
import { useLocalStorage } from '../../lib/hooks';

type Format = 'image/webp' | 'image/jpeg' | 'image/png';

const MAX_WIDTHS = [0, 1920, 1280, 800];

interface Result {
  url: string;
  blob: Blob;
  width: number;
  height: number;
}

export default function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<{ url: string; width: number; height: number } | null>(null);
  const [format, setFormat] = useLocalStorage<Format>('tool:img:format', 'image/webp');
  const [quality, setQuality] = useLocalStorage('tool:img:quality', 80);
  const [maxWidth, setMaxWidth] = useLocalStorage('tool:img:maxw', 0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 读入原图，拿到尺寸
  useEffect(() => {
    if (!file) {
      setSource(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSource({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => {
      setError('无法读取这个图片文件');
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 参数变化就重新编码
  useEffect(() => {
    if (!file || !source) {
      setResult(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;
    setBusy(true);

    const img = new Image();
    img.onload = () => {
      const scale = maxWidth > 0 && source.width > maxWidth ? maxWidth / source.width : 1;
      const width = Math.round(source.width * scale);
      const height = Math.round(source.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('当前浏览器不支持 Canvas');
        setBusy(false);
        return;
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (cancelled || !blob) {
            setBusy(false);
            return;
          }
          createdUrl = URL.createObjectURL(blob);
          setResult({ url: createdUrl, blob, width, height });
          setError(null);
          setBusy(false);
        },
        format,
        // PNG 是无损格式，quality 参数会被忽略
        format === 'image/png' ? undefined : quality / 100,
      );
    };
    img.src = source.url;

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [file, source, format, quality, maxWidth]);

  const download = () => {
    if (!result || !file) return;
    const ext = format.split('/')[1];
    const base = file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${base}-compressed.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/*"
        file={file}
        onFile={(f) => {
          setFile(f);
          setError(null);
        }}
        onClear={() => {
          setFile(null);
          setResult(null);
        }}
        label="把图片拖到这里，或点击选择"
        hint="支持 JPG / PNG / WebP / GIF，图片不会上传"
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      {file && (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Field label="输出格式">
              <Segmented
                aria-label="输出格式"
                value={format}
                onChange={setFormat}
                options={[
                  { value: 'image/webp', label: 'WebP' },
                  { value: 'image/jpeg', label: 'JPEG' },
                  { value: 'image/png', label: 'PNG' },
                ]}
              />
            </Field>

            <Field label="最大宽度">
              <Segmented
                aria-label="最大宽度"
                value={String(maxWidth)}
                onChange={(v) => setMaxWidth(Number(v))}
                options={MAX_WIDTHS.map((w) => ({ value: String(w), label: w === 0 ? '原始' : `${w}px` }))}
              />
            </Field>
          </div>

          {format !== 'image/png' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="img-quality" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                  质量
                </label>
                <span className="font-mono text-sm tabular-nums text-fg">{quality}</span>
              </div>
              <input
                id="img-quality"
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
            </div>
          )}

          <Panel title="结果">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-fg-subtle">原图</p>
                {source && (
                  <img src={source.url} alt="原图" className="max-h-56 w-auto rounded-lg border border-border" />
                )}
                <p className="mt-2 font-mono text-xs text-fg-muted">
                  {formatBytes(file.size)}
                  {source && ` · ${source.width}×${source.height}`}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-fg-subtle">压缩后{busy && ' · 处理中…'}</p>
                {result && (
                  <img src={result.url} alt="压缩后" className="max-h-56 w-auto rounded-lg border border-border" />
                )}
                {result && (
                  <p className="mt-2 font-mono text-xs">
                    <span className="text-fg-muted">
                      {formatBytes(result.blob.size)} · {result.width}×{result.height}
                    </span>
                    <span className={cn('ml-2 font-medium', result.blob.size < file.size ? 'text-success' : 'text-warning')}>
                      {percentChange(file.size, result.blob.size)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {result && (
              <Button variant="primary" onClick={download} className="mt-4">
                <Download size={15} />
                下载（{formatBytes(result.blob.size)}）
              </Button>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
