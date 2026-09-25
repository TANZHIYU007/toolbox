import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'url-encode',
  name: 'URL 编解码',
  description: '百分号编码（percent-encoding）互转，并可拆解查询参数。',
  category: 'encode',
  icon: 'link',
  keywords: ['url', 'uri', 'encode', 'decode', 'percent', 'escape', '编码', '解码', '转义', '参数'],
  about:
    'URL 里只能出现有限的 ASCII 字符，中文和特殊符号必须转成 %XX 形式。' +
    'encodeURIComponent 会转义 & = ? / 等分隔符，适合处理单个参数值；encodeURI 保留这些分隔符，' +
    '适合处理一整条 URL。选错会导致参数被截断或整条链接失效，所以两种模式都提供了。',
  faq: [
    {
      q: 'encodeURIComponent 和 encodeURI 该用哪个？',
      a: '编码单个参数值（比如搜索词）用 encodeURIComponent；处理一整条已经拼好的 URL 用 encodeURI，它不会破坏 :// ? & = 这些结构字符。',
    },
    {
      q: '空格为什么有时是 %20 有时是 +？',
      a: '%20 是标准的 URL 编码；+ 只在 application/x-www-form-urlencoded 表单提交的场景里表示空格。本工具输出标准的 %20。',
    },
  ],
  detect(input) {
    const matches = input.match(/%[0-9A-Fa-f]{2}/g);
    if (!matches || matches.length < 2) return null;
    try {
      const decoded = decodeURIComponent(input);
      if (decoded === input) return null;
      return { score: 0.8, hint: `含 ${matches.length} 处百分号编码，可解码` };
    } catch {
      return { score: 0.4, hint: '含百分号编码但格式有误' };
    }
  },
};

export default meta;
