import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'cron',
  name: 'Cron 表达式',
  description: '把 Cron 表达式翻译成人话，并算出接下来几次执行时间。',
  category: 'time',
  icon: 'calendar-clock',
  keywords: ['cron', 'crontab', 'schedule', 'job', '定时', '任务', '表达式', '调度'],
  featured: true,
  about:
    'Cron 表达式的五个字段依次是：分钟、小时、日、月、星期。写错一个字段，任务就可能一天跑几百次，' +
    '或者一年只跑一次。本工具把表达式翻译成中文描述，同时算出接下来 5 次实际执行时间 —— ' +
    '后者比描述更能暴露问题，建议每次都扫一眼。',
  faq: [
    {
      q: '为什么我的任务每分钟都在跑？',
      a: '最常见的错误是把 `0 */2 * * *`（每两小时的整点）写成了 `* */2 * * *`（那两小时里的每一分钟）。第一个字段留 * 就等于每分钟。',
    },
    {
      q: '日和星期同时指定会怎样？',
      a: '标准 Cron 里这两个字段是「或」的关系——满足任意一个就执行，不是「与」。比如 `0 0 1 * 1` 表示每月 1 号和每周一都执行。',
    },
    {
      q: '支持秒级（6 位）表达式吗？',
      a: '支持。Quartz 和 Spring 风格的 6 位表达式（最前面多一个秒字段）也能解析。',
    },
  ],
  detect(input) {
    const text = input.trim();
    const fields = text.split(/\s+/);
    if (fields.length < 5 || fields.length > 6) return null;
    if (!/^[\d*/,\-?LW#]+$/.test(fields.join(''))) return null;
    if (!text.includes('*') && !text.includes('/') && !/\d/.test(text)) return null;
    return { score: 0.7, hint: `像是 ${fields.length} 字段的 Cron 表达式，可解析` };
  },
};

export default meta;
