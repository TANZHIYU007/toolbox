import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'regex',
  name: '正则测试',
  description: '实时测试正则表达式，高亮匹配结果并列出捕获分组。',
  category: 'text',
  icon: 'regex',
  keywords: ['regex', 'regexp', 'pattern', 'match', '正则', '表达式', '匹配', '测试'],
  featured: true,
  about:
    '正则表达式最难的地方是写完不知道对不对。这里边改边看：匹配到的片段会在原文里高亮，' +
    '每一处匹配的捕获分组也会单独列出来。支持 g（全局）、i（忽略大小写）、m（多行）、s（点匹配换行）等常用标志。' +
    '正则在你的浏览器里执行，不会发送到任何服务器。',
  faq: [
    {
      q: '为什么我的正则一个都匹配不到？',
      a: '先检查是不是忘了转义特殊字符（. * + ? ( ) [ ] { } | \\ ^ $ 都需要加反斜杠才能表示字面量），再确认有没有勾选 i 标志导致大小写不符。',
    },
    {
      q: '页面卡住了怎么办？',
      a: '可能写出了灾难性回溯的正则（比如 (a+)+b 遇到长串 a）。刷新页面，然后简化嵌套的量词。',
    },
  ],
};

export default meta;
