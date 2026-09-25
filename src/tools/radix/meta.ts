import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'radix',
  name: '进制转换',
  description: '二进制、八进制、十进制、十六进制及任意进制互转，支持大数。',
  category: 'encode',
  icon: 'calculator',
  keywords: ['radix', 'base', 'binary', 'hex', 'octal', 'decimal', '进制', '二进制', '十六进制', '转换'],
  about:
    '调试位运算、看内存地址、处理权限掩码时经常要换算进制。本工具用 BigInt 实现，' +
    '所以不受 JavaScript 双精度浮点数 2^53 的精度限制，超长的十六进制串也能精确转换。' +
    '同时支持 2 到 36 之间的任意进制。',
  faq: [
    {
      q: '为什么支持到 36 进制？',
      a: '因为用 0-9 加上 a-z 一共只有 36 个字符可以表示一位。超过 36 就没有约定俗成的字符集了。',
    },
    {
      q: '支持负数和小数吗？',
      a: '支持负整数。小数暂不支持——不同进制下的小数表示涉及精度取舍，容易给出误导性结果。',
    },
  ],
  detect(input) {
    const text = input.trim();
    if (/^0x[0-9a-fA-F]+$/.test(text)) return { score: 0.85, hint: '十六进制数，可转成其他进制' };
    if (/^0b[01]+$/.test(text)) return { score: 0.85, hint: '二进制数，可转成其他进制' };
    if (/^[01]{8,}$/.test(text)) return { score: 0.5, hint: '像二进制串，可转成其他进制' };
    return null;
  },
};

export default meta;
