import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'unicode',
  name: 'Unicode 转义',
  description: '文本与 \\uXXXX 转义序列、HTML 实体之间互相转换。',
  category: 'encode',
  icon: 'code',
  keywords: ['unicode', 'escape', 'html entity', 'utf', '转义', '实体', '编码', '乱码'],
  about:
    '把中文转成 \\u4e2d\\u6587 这样的转义序列，常用于配置文件、JSON 字符串或只接受 ASCII 的场景。' +
    'HTML 实体（&amp;lt; &amp;amp;）则用于在网页里安全地显示尖括号等特殊字符，是防止 XSS 的基础手段之一。' +
    '两种转换都支持反向还原。',
  faq: [
    {
      q: 'emoji 为什么转出来是两个 \\u？',
      a: '超出基本多文种平面的字符（比如大部分 emoji）在 UTF-16 里用两个代理对表示，所以是两个 \\uXXXX。还原时会正确合并回来。',
    },
    {
      q: 'HTML 实体编码能防 XSS 吗？',
      a: '能防住最基础的标签注入，但真正的防护要看输出位置（HTML 文本、属性、JS、URL 各有不同规则），生产环境请用成熟的库。',
    },
  ],
  detect(input) {
    const text = input.trim();
    if (/\\u[0-9a-fA-F]{4}/.test(text)) {
      const count = (text.match(/\\u[0-9a-fA-F]{4}/g) ?? []).length;
      return { score: 0.88, hint: `含 ${count} 个 Unicode 转义序列，可还原` };
    }
    if (/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/.test(text)) {
      return { score: 0.75, hint: '含 HTML 实体，可还原成原文' };
    }
    return null;
  },
};

export default meta;
