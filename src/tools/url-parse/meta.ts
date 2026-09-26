import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'url-parse',
  name: 'URL 解析器',
  description: '拆解 URL 的协议、域名、路径、端口、锚点和查询参数。',
  category: 'encode',
  icon: 'globe',
  keywords: ['url', 'parse', 'query', 'parameter', 'host', 'domain', '链接', '解析', '查询参数', '域名'],
  featured: true,
  about: '使用浏览器原生 URL API 在本地解析链接，清晰展示每一部分以及所有查询参数。重复参数会逐项保留，适合检查回调地址、追踪链接和接口请求。',
  faq: [
    { q: '输入内容会发送到服务器吗？', a: '不会。URL 的解析和参数解码完全在当前浏览器中完成。' },
    { q: '为什么相对路径无法解析？', a: '相对路径缺少协议和域名，含义取决于所在页面。本工具要求输入带协议的完整 URL。' },
  ],
  detect(input) {
    try {
      const url = new URL(input.trim());
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      return { score: 0.96, hint: `检测到 ${url.hostname}，可拆解 URL 和查询参数` };
    } catch {
      return null;
    }
  },
};

export default meta;
