import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'hash',
  name: '哈希计算',
  description: '计算文本的 SHA-1 / SHA-256 / SHA-384 / SHA-512 摘要。',
  category: 'crypto',
  icon: 'fingerprint',
  keywords: ['hash', 'sha', 'sha256', 'sha1', 'digest', 'checksum', '哈希', '摘要', '校验', '签名'],
  featured: true,
  about:
    '哈希函数把任意长度的输入压缩成固定长度的摘要，相同输入必然得到相同输出，' +
    '常用于校验文件完整性、比对内容是否变化、生成缓存键。本工具使用浏览器原生的 Web Crypto API，' +
    '计算在本地完成。注意 SHA-1 已被证明存在碰撞，新系统请使用 SHA-256 及以上。',
  faq: [
    {
      q: '为什么没有 MD5？',
      a: '浏览器原生的 Web Crypto API 不提供 MD5（它早已不安全）。如果确实需要，得额外引入一个 JS 实现，后续可以作为单独工具加上。',
    },
    {
      q: '哈希能还原成原文吗？',
      a: '不能，它是单向的。所谓「解密 MD5」实际上是查彩虹表 —— 拿常见口令的哈希值做字典匹配，并不是真的逆运算。',
    },
  ],
};

export default meta;
