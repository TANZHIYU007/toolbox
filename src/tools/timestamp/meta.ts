import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'timestamp',
  name: '时间戳转换',
  description: 'Unix 时间戳与日期时间双向转换，自动识别秒和毫秒。',
  category: 'time',
  icon: 'clock',
  keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', '时间戳', '日期', '时间', '毫秒'],
  featured: true,
  about:
    'Unix 时间戳是从 1970-01-01 00:00:00 UTC 起经过的秒数，日志和数据库里非常常见。' +
    '10 位是秒级、13 位是毫秒级，本工具会自动判断，并同时给出本地时间、UTC 时间和 ISO 8601 格式。' +
    '反方向也支持：填入日期字符串即可得到时间戳。',
  faq: [
    {
      q: '10 位和 13 位有什么区别？',
      a: '10 位是秒级时间戳（多见于后端、Unix 工具），13 位是毫秒级（JavaScript 的 Date.now() 就是这个）。本工具按位数自动区分。',
    },
    {
      q: '显示的是哪个时区？',
      a: '「本地时间」用你系统当前的时区，同时也会列出 UTC 时间和带时区偏移的 ISO 8601 字符串，便于比对。',
    },
  ],
  detect(input) {
    if (!/^\d{9,13}$/.test(input)) return null;
    const unit = input.length >= 12 ? '毫秒' : '秒';
    const ms = input.length >= 12 ? Number(input) : Number(input) * 1000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    return {
      score: 0.92,
      hint: `${unit}级时间戳 → ${date.toLocaleString('zh-CN')}`,
    };
  },
};

export default meta;
