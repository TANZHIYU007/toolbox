import type { ToolMeta } from '../types';
import { base64ToUtf8, looksLikeBase64, printableRatio } from '../../lib/codec';

const meta: ToolMeta = {
  id: 'base64',
  name: 'Base64 编解码',
  description: '文本与 Base64 互转，支持中文和 URL 安全变体。',
  category: 'encode',
  icon: 'binary',
  keywords: ['base64', 'encode', 'decode', 'atob', 'btoa', '编码', '解码', '转换'],
  featured: true,
  about:
    'Base64 把任意字节用 64 个可打印字符表示，常用于在纯文本协议里携带二进制数据。' +
    '注意浏览器原生的 btoa 只接受 Latin-1 字符，直接编码中文会抛异常；本工具先用 UTF-8 编码成字节再转换，' +
    '所以中文、emoji 都能正确往返。URL 安全变体把 + / 换成 - _ 并去掉末尾的 =，用于放进 URL 或文件名。',
  faq: [
    {
      q: '为什么别的工具编码中文会乱码？',
      a: '因为它们直接调用了 btoa。正确做法是先把字符串用 UTF-8 编码成字节序列再做 Base64，本工具就是这么做的。',
    },
    {
      q: 'Base64 算加密吗？',
      a: '不算。它只是一种编码，任何人都能直接解开，不提供任何保密性。需要保密请用真正的加密算法。',
    },
  ],
  detect(input) {
    if (!looksLikeBase64(input)) return null;
    try {
      const decoded = base64ToUtf8(input);
      if (!decoded || printableRatio(decoded) < 0.9) return null;
      const preview = decoded.length > 24 ? `${decoded.slice(0, 24)}…` : decoded;
      return { score: 0.72, hint: `可解码为：${preview}` };
    } catch {
      return null;
    }
  },
};

export default meta;
