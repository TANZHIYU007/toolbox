import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'text-tools',
  name: '文本处理',
  description: '去重、排序、去空行、大小写、加行号等常用文本操作。',
  category: 'text',
  icon: 'align-left',
  keywords: ['text', 'dedupe', 'sort', 'trim', 'lines', '去重', '排序', '去空行', '行号', '统计', '大小写'],
  about:
    '整理日志、清洗名单、处理导出数据时常用的一组小操作，全部可以叠加使用：先去空行、再去重、再排序。' +
    '每一步都直接作用在文本上，随时可以撤销重来。下方还会实时统计字符数、词数、行数和中文字数。',
  faq: [
    {
      q: '排序是按什么规则？',
      a: '默认用自然排序，数字会按数值大小而不是字符串比较，所以 item2 会排在 item10 前面，符合直觉。',
    },
    {
      q: '中文字数是怎么算的？',
      a: '统计所有落在 CJK 统一汉字区间的字符个数，标点和英文不计入。',
    },
  ],
};

export default meta;
