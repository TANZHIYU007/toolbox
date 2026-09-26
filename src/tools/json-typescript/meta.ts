import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'json-typescript',
  name: 'JSON 转 TypeScript',
  description: '根据 JSON 数据生成 TypeScript interface 或 type 类型定义。',
  category: 'text',
  icon: 'braces',
  keywords: ['json', 'typescript', 'interface', 'type', 'schema', '类型', '接口', '生成'],
  featured: true,
  about: '从实际 JSON 样例递归推断 TypeScript 类型，并自动提取嵌套对象。适合作为接口响应类型的起点，生成后仍建议结合业务语义检查可选和可空字段。',
  faq: [
    { q: '为什么空数组会生成 unknown[]？', a: '空数组没有元素可供推断，unknown[] 比 any[] 更安全，也能提醒你补充准确类型。' },
    { q: '生成结果可以直接用于生产代码吗？', a: '它基于单份样例推断。样例未出现的字段和取值无法获知，因此仍应结合接口文档检查。' },
  ],
};

export default meta;
