import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'image-base64',
  name: '图片转 Base64',
  description: '把图片转成 Data URL，直接内嵌进 HTML 或 CSS。',
  category: 'visual',
  icon: 'image-plus',
  keywords: ['base64', 'data url', 'image', 'inline', '图片', '内嵌', '转码', 'dataurl'],
  about:
    'Data URL 把图片内容直接写进 HTML 或 CSS，省掉一次 HTTP 请求，适合图标、占位图这类很小的图片。' +
    '代价是 Base64 编码会让体积增大约 33%，而且内嵌的内容无法被浏览器单独缓存 —— ' +
    '所以超过几 KB 的图片通常还是用普通链接更划算。',
  faq: [
    {
      q: '多大的图片适合转 Data URL？',
      a: '经验值是 4KB 以内。再大的话，增加的 33% 体积和失去的缓存收益就超过省下那次请求的好处了。',
    },
    {
      q: '为什么我的 SVG 转出来特别长？',
      a: 'SVG 是文本格式，其实可以直接内联进 HTML，或者用 URL 编码（而不是 Base64）嵌进 CSS，体积会小很多。转 Base64 是最浪费的方式。',
    },
  ],
};

export default meta;
