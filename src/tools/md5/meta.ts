import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'md5',
  name: 'MD5 计算',
  description: '计算文本的 MD5 摘要，支持 16 位和 32 位输出。',
  category: 'crypto',
  icon: 'hash',
  keywords: ['md5', 'hash', 'digest', 'checksum', '摘要', '哈希', '校验'],
  about:
    'MD5 生成 128 位（32 个十六进制字符）摘要，至今仍广泛用于文件完整性校验和老系统的接口签名。' +
    '但它在 2004 年就被证明可以构造碰撞，所以绝不能用于密码存储或数字签名等安全场景 —— ' +
    '那些场合请用 SHA-256 加盐，或者专门的密码哈希算法如 bcrypt、Argon2。',
  faq: [
    {
      q: '和「哈希计算」工具有什么区别？',
      a: '那个工具用浏览器原生的 Web Crypto API，只提供 SHA 系列。Web Crypto 出于安全考虑不实现 MD5，所以 MD5 单独做了一份实现放在这里。',
    },
    {
      q: '16 位 MD5 是什么？',
      a: '不是另一种算法，就是把 32 位结果取中间 16 个字符（第 9 到 24 位）。某些老系统用这个格式，安全性比 32 位更弱。',
    },
    {
      q: '能用来存密码吗？',
      a: '绝对不要。MD5 计算极快，一块显卡每秒能试上百亿次，常见密码几秒就被撞出来。密码存储请用 bcrypt 或 Argon2。',
    },
  ],
};

export default meta;
