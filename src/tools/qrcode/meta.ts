import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'qrcode',
  name: '二维码生成',
  description: '把文本或链接生成二维码，可下载 PNG。',
  category: 'generate',
  icon: 'qrcode',
  keywords: ['qrcode', 'qr', '二维码', '扫码', '生成', 'png', '链接'],
  featured: true,
  about:
    '二维码本质上是把一段文本编码成黑白方块矩阵。容错等级越高，被遮挡或磨损后依然可识别的概率越大，' +
    '但同样内容需要的方块更多、图案更密。一般屏幕显示用 M 级足够，印刷品或可能被遮挡的场景用 Q 或 H。' +
    '生成完全在浏览器本地完成，内容不会上传。',
  faq: [
    {
      q: '容错等级怎么选？',
      a: 'L 约 7%、M 约 15%、Q 约 25%、H 约 30%。屏幕上扫用 M，印在物料上或中间要盖 logo 就用 H。',
    },
    {
      q: '能放多少内容？',
      a: '理论上限几千字符，但内容越长图案越密、越难扫。放链接建议先短链化，纯文本控制在 300 字符内体验较好。',
    },
  ],
  detect(input) {
    if (!/^https?:\/\/\S+$/i.test(input.trim())) return null;
    return { score: 0.45, hint: '是个链接，可以生成二维码' };
  },
};

export default meta;
