import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'timezone',
  name: '时区转换',
  description: '一个时间在多个时区分别是几点，跨国协作对表用。',
  category: 'time',
  icon: 'globe',
  keywords: ['timezone', 'utc', 'gmt', 'time', '时区', '时差', '换算', '国际'],
  about:
    '安排跨国会议、看国外服务器日志、对接海外接口时，总要在脑子里做时差加减，很容易算错。' +
    '这里选定一个基准时间和基准时区，其余时区的对应时刻会一次性全部列出，夏令时也由浏览器的 ' +
    'Intl API 自动处理（这正是手算最容易出错的地方）。',
  faq: [
    {
      q: '夏令时会自动处理吗？',
      a: '会。使用浏览器内置的 IANA 时区数据库，纽约、伦敦这些实行夏令时的地区会按当天的实际规则换算，不是固定偏移。',
    },
    {
      q: '为什么中国只有一个时区？',
      a: '中国大陆全境统一使用 UTC+8（Asia/Shanghai），不实行夏令时，所以不存在境内时差问题。',
    },
  ],
};

export default meta;
