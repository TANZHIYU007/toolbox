/** 字节数转人类可读（1536 → "1.5 KB"） */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/** 百分比变化，用于展示压缩效果 */
export function percentChange(from: number, to: number): string {
  if (from === 0) return '—';
  const delta = ((to - from) / from) * 100;
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}
