import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'gradient',
  name: 'CSS 渐变生成',
  description: '可视化调节线性 / 径向渐变，直接复制 CSS 代码。',
  category: 'visual',
  icon: 'blend',
  keywords: ['gradient', 'css', 'linear', 'radial', '渐变', '背景', '配色', '样式'],
  about:
    'CSS 渐变的语法本身不难，难的是不预览就想象不出效果，只能改一行刷一次。' +
    '这里拖动即可看到结果，满意了直接复制代码。支持线性和径向渐变、任意角度、多个色标，' +
    '以及各色标的位置微调。',
  faq: [
    {
      q: '角度是怎么算的？',
      a: 'CSS 里 0deg 表示从下往上，90deg 从左往右，180deg 从上往下。和数学里的极角定义不同，这是最容易搞混的地方。',
    },
    {
      q: '为什么渐变中间会发灰？',
      a: '因为浏览器默认在 sRGB 空间做插值，互补色之间过渡就容易经过灰色。加一个中间色标，或改用 oklch 插值可以缓解。',
    },
  ],
};

export default meta;
