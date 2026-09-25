import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'color',
  name: '颜色转换',
  description: 'HEX / RGB / HSL 互转，并给出对比度参考。',
  category: 'visual',
  icon: 'palette',
  keywords: ['color', 'hex', 'rgb', 'hsl', 'contrast', '颜色', '色值', '转换', '取色', '对比度'],
  about:
    'HEX 适合写在 CSS 里，RGB 便于程序计算，HSL 调整明暗和饱和度最直观（改一个数字就能得到同色系的深浅变体）。' +
    '工具同时给出该颜色与纯白、纯黑文字的对比度，按 WCAG 标准，正文需要至少 4.5:1 才算可读。',
  faq: [
    {
      q: '对比度 4.5:1 是什么意思？',
      a: 'WCAG 无障碍标准对正文的最低要求。大号文字（18pt 以上或加粗 14pt）可放宽到 3:1。低于这个值，弱视用户会看不清。',
    },
    {
      q: '支持带透明度的颜色吗？',
      a: '支持。#rrggbbaa、rgba() 和 hsla() 都能解析，转换结果也会保留 alpha 通道。',
    },
  ],
  detect(input) {
    const text = input.trim().toLowerCase();
    if (/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(text)) {
      return { score: 0.85, hint: '看起来是十六进制颜色值' };
    }
    if (/^(rgba?|hsla?)\(/.test(text)) {
      return { score: 0.9, hint: '看起来是 CSS 颜色函数' };
    }
    return null;
  },
};

export default meta;
