import { useEffect, useState } from 'react';
import FileDrop from '../../components/ui/FileDrop';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';
import ResultRow from '../../components/ui/ResultRow';
import { formatBytes } from '../../lib/format';

export default function ImageBase64Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setDataUrl('');
      return;
    }

    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled) {
        setDataUrl(typeof reader.result === 'string' ? reader.result : '');
        setError(null);
      }
    };
    reader.onerror = () => {
      if (!cancelled) setError('读取文件失败');
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file]);

  const overhead = file && dataUrl ? dataUrl.length / file.size : 0;
  const tooBig = file ? file.size > 4096 : false;

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/*"
        file={file}
        onFile={(f) => {
          setFile(f);
          setError(null);
        }}
        onClear={() => setFile(null)}
        label="把图片拖到这里，或点击选择"
        hint="小图标最适合内嵌，图片不会上传"
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      {dataUrl && file && (
        <>
          <Panel title="预览">
            <div className="flex flex-wrap items-center gap-5">
              <img
                src={dataUrl}
                alt="预览"
                className="max-h-32 w-auto rounded-lg border border-border bg-surface-2"
              />
              <div className="text-xs text-fg-muted">
                <p>原始体积：<span className="font-mono">{formatBytes(file.size)}</span></p>
                <p className="mt-1">
                  Data URL：<span className="font-mono">{formatBytes(dataUrl.length)}</span>
                  <span className="ml-1.5 text-fg-subtle">(+{Math.round((overhead - 1) * 100)}%)</span>
                </p>
                {tooBig && (
                  <p className="mt-2 text-warning">
                    超过 4KB，建议改用普通图片链接（能被缓存，也不会撑大 HTML/CSS）
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <IOArea label="Data URL" value={dataUrl} rows={8} readOnly />

          <Panel title="直接可用的代码">
            <div className="space-y-2">
              <ResultRow label="HTML" value={`<img src="${dataUrl.slice(0, 40)}…" alt="">`} />
              <ResultRow label="CSS" value={`background-image: url("${dataUrl.slice(0, 40)}…");`} />
            </div>
            <p className="mt-2 text-xs text-fg-subtle">
              上面两行为了可读做了截断，完整内容请从「Data URL」框复制。
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
