import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'password',
  name: '密码生成',
  description: '生成高强度随机密码，可调长度和字符集，附强度估算。',
  category: 'generate',
  icon: 'lock',
  keywords: ['password', 'random', 'secure', 'generate', '密码', '随机', '强度', '生成'],
  featured: true,
  about:
    '使用 crypto.getRandomValues() 从操作系统的密码学安全随机源取值，并采用拒绝采样消除取模偏差，' +
    '保证每个字符等概率出现 —— 这点比看起来重要，用 Math.random() 或简单取模生成的密码熵值会显著低于标称值。' +
    '生成过程完全在本地，密码不会经过任何网络。',
  faq: [
    {
      q: '熵（bit）是什么意思？',
      a: '衡量密码有多难猜。每多 1 bit，破解所需尝试次数翻倍。低于 60 bit 属于偏弱，80 bit 以上对绝大多数场景足够，重要账户建议 100 bit 以上。',
    },
    {
      q: '为什么要排除易混字符？',
      a: '0 和 O、1 和 l 和 I 在很多字体里几乎一样。如果密码需要手抄或口头传达，排除它们能少很多麻烦；纯粘贴使用则不必排除，字符集越大熵越高。',
    },
    {
      q: '这个页面会记录生成的密码吗？',
      a: '不会。页面没有后端，密码只存在于当前标签页的内存里，刷新即消失，也不会写入 localStorage。',
    },
  ],
};

export default meta;
