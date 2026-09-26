import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'json-yaml',
  name: 'JSON ↔ YAML',
  description: '在 JSON 与 YAML 之间双向转换，支持格式校验和缩进设置。',
  category: 'text',
  icon: 'code',
  keywords: ['json', 'yaml', 'yml', 'convert', '转换', '配置文件', '格式化'],
  featured: true,
  about: '适合转换应用配置、CI 工作流和接口示例。解析与转换全部在浏览器本地完成；YAML 解析器仅在打开本工具时按需加载。',
  faq: [
    { q: 'YAML 中的注释会保留吗？', a: '不会。转换过程会先解析为数据结构，因此注释、锚点写法和原始排版不会保留。' },
    { q: '支持多个 YAML 文档吗？', a: '当前一次只转换一个 YAML 文档；检测到多个文档时会提示错误，避免静默丢失内容。' },
  ],
  detect(input) {
    const text = input.trim();
    if (/^---(?:\s|$)/.test(text) || (/^[\w"'-]+:\s+.+/m.test(text) && text.includes('\n'))) {
      return { score: 0.72, hint: '看起来是 YAML，可转换为 JSON' };
    }
    return null;
  },
};

export default meta;
