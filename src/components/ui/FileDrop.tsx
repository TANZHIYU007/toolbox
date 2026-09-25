import { useRef, useState, type DragEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatBytes } from '../../lib/format';

interface Props {
  /** 如 'image/*'，同时用于 input 的 accept 和拖入时的提示 */
  accept?: string;
  onFile: (file: File) => void;
  /** 当前已选文件，传了就显示文件信息条 */
  file?: File | null;
  onClear?: () => void;
  label?: string;
  hint?: string;
}

/**
 * 文件拖入 / 点击选择。
 * 所有跟文件打交道的工具（图片压缩、图片转 Base64、二维码识别…）共用这一个，
 * 所以拖拽高亮、键盘可达、清除按钮这些细节只需要做对一次。
 */
export default function FileDrop({
  accept, onFile, file, onClear,
  label = '把文件拖到这里，或点击选择',
  hint,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const take = (files: FileList | null) => {
    const picked = files?.[0];
    if (picked) onFile(picked);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">{file.name}</span>
          <span className="text-xs text-fg-subtle">
            {formatBytes(file.size)}
            {file.type && ` · ${file.type}`}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = '';
            onClear?.();
          }}
          aria-label="移除文件"
          className="shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X size={16} />
        </button>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => take(e.target.files)} />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10',
        'text-center transition-colors duration-150',
        dragging
          ? 'border-brand bg-brand-soft'
          : 'border-border bg-surface hover:border-fg-subtle/60 hover:bg-surface-2',
      )}
    >
      <Upload size={22} className={cn('transition-colors', dragging ? 'text-brand' : 'text-fg-subtle')} />
      <span className="text-sm font-medium text-fg-muted">{label}</span>
      {hint && <span className="text-xs text-fg-subtle">{hint}</span>}
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => take(e.target.files)} />
    </div>
  );
}
