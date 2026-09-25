import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'case-convert',
  name: '命名风格转换',
  description: 'camelCase / snake_case / kebab-case 等命名风格一键互转。',
  category: 'text',
  icon: 'case',
  keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', '命名', '驼峰', '下划线', '短横线', '变量名'],
  about:
    '不同语言和场景的命名约定不一样：JavaScript 变量用 camelCase，Python 和数据库字段用 snake_case，' +
    'CSS 类名和 URL 用 kebab-case，类名用 PascalCase，常量用 SCREAMING_SNAKE_CASE。' +
    '跨语言开发时来回手改很费劲，这里粘进任意一种，其余全部自动给出。',
  faq: [
    {
      q: '支持中文吗？',
      a: '中文没有大小写和单词边界的概念，转换意义不大。本工具针对英文标识符设计，中文会原样保留。',
    },
    {
      q: '连续大写（比如 HTTPResponse）怎么处理？',
      a: '会被识别成一个词「HTTP」加一个词「Response」，转成 snake_case 得到 http_response，符合大多数语言的习惯。',
    },
  ],
  detect(input) {
    const text = input.trim();
    if (text.length > 60 || /\s{2,}|\n/.test(text)) return null;
    if (/^[A-Za-z][A-Za-z0-9]*([_-][A-Za-z0-9]+)+$/.test(text) || /^[a-z]+([A-Z][a-z0-9]*)+$/.test(text)) {
      return { score: 0.6, hint: '像一个标识符，可转换命名风格' };
    }
    return null;
  },
};

export default meta;
