import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'json-format',
  name: 'JSON 格式化',
  description: '格式化、压缩和校验 JSON，语法错误会指出具体位置。',
  category: 'text',
  icon: 'braces',
  keywords: ['json', 'format', 'beautify', 'minify', 'validate', '格式化', '压缩', '校验', '美化'],
  featured: true,
  about:
    'JSON 格式化的常见用途是把接口返回的一整行压缩数据展开成可读结构，或者反过来压缩以节省传输体积。' +
    '解析失败时会给出出错的行列位置，便于定位多余逗号、缺引号这类问题。整个过程在浏览器本地完成，' +
    '粘贴生产环境数据也不会外传。',
  faq: [
    {
      q: '数据会上传到服务器吗？',
      a: '不会。格式化用的是浏览器内置的 JSON.parse，页面本身也没有后端，断网状态下同样可用。',
    },
    {
      q: '为什么提示 Unexpected token？',
      a: '通常是多了尾随逗号、用了单引号、或者键名没加双引号。JSON 标准比 JavaScript 对象字面量严格，这些写法都不合法。',
    },
  ],
  detect(input) {
    const text = input.trim();
    const first = text[0];
    if (first !== '{' && first !== '[') return null;
    try {
      JSON.parse(text);
      const multiline = text.includes('\n');
      return {
        score: 0.96,
        hint: multiline ? '合法的 JSON，可以压缩' : '合法的 JSON，可以展开格式化',
      };
    } catch {
      return { score: 0.55, hint: '像 JSON 但解析失败，可以定位错误位置' };
    }
  },
};

export default meta;
