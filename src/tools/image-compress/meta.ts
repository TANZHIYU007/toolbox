import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'image-compress',
  name: '图片压缩',
  description: '压缩图片体积、调整尺寸、转换 WebP/JPEG/PNG，全程本地处理。',
  category: 'visual',
  icon: 'image-down',
  keywords: ['image', 'compress', 'resize', 'webp', 'jpeg', 'png', '图片', '压缩', '缩放', '转换', '体积'],
  featured: true,
  about:
    '用浏览器的 Canvas 重新编码图片，在几乎看不出差别的前提下大幅减小体积。' +
    'WebP 通常比同质量的 JPEG 再小 25%~35%，现代浏览器全都支持。' +
    '整个过程在你的设备上完成，图片不会上传到任何服务器 —— 这是在线压缩工具里少见的，' +
    '处理包含个人信息的截图时尤其重要。',
  faq: [
    {
      q: '为什么处理后反而变大了？',
      a: '如果原图已经是高压缩率的 JPEG，再用高质量参数重新编码就可能变大。把质量调低一些，或者换成 WebP 格式试试。PNG 转 PNG 也常出现这种情况。',
    },
    {
      q: '会丢失 EXIF 信息吗？',
      a: '会。Canvas 重新编码不保留 EXIF，拍摄参数和 GPS 位置都会被清除。想保护隐私时这是优点，想保留拍摄信息时就要注意了。',
    },
    {
      q: '支持多大的图片？',
      a: '受设备内存限制，手机上建议不超过 4000×4000，桌面浏览器可以处理更大的。超大图片可能导致页面卡顿。',
    },
  ],
};

export default meta;
