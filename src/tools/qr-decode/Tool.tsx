import { useEffect, useState } from 'react';
import FileDrop from '../../components/ui/FileDrop';
import IOArea from '../../components/ui/IOArea';
import Panel from '../../components/ui/Panel';

export default function QrDecodeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'fail'>('idle');

  useEffect(() => {
    if (!file) {
      setPreview('');
      setText('');
      setStatus('idle');
      return;
    }

    let cancelled = false;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus('working');

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        if (!cancelled) setStatus('fail');
        return;
      }
      ctx.drawImage(img, 0, 0);

      try {
        // jsQR 只在本工具用到，按需加载
        const { default: jsQR } = await import('jsqr');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (cancelled) return;
        if (code?.data) {
          setText(code.data);
          setStatus('done');
        } else {
          setText('');
          setStatus('fail');
        }
      } catch {
        if (!cancelled) setStatus('fail');
      }
    };
    img.onerror = () => {
      if (!cancelled) setStatus('fail');
    };
    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const isUrl = /^https?:\/\//i.test(text.trim());

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/*"
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
        label="把二维码图片拖到这里，或点击选择"
        hint="截图也可以，图片不会上传"
      />

      {preview && (
        <Panel title="图片">
          <img src={preview} alt="待识别的二维码" className="max-h-48 w-auto rounded-lg border border-border bg-white" />
        </Panel>
      )}

      {status === 'working' && <p className="text-sm text-fg-muted">识别中…</p>}

      {status === 'fail' && (
        <p className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          没能从这张图里识别出二维码。试试截取二维码本身并放大，或换一张更清晰的图。
        </p>
      )}

      {status === 'done' && (
        <>
          <IOArea label="识别结果" value={text} rows={5} readOnly mono={false} />

          {isUrl && (
            <div className="rounded-xl border border-warning/40 bg-surface px-4 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">这是一个链接</p>
              <code className="mt-1.5 block break-all font-mono text-[13px] text-fg">{text}</code>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                请先确认域名是你预期的再访问。二维码常被用于钓鱼，
                本工具刻意不提供「直接打开」按钮。
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
