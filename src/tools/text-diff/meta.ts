import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'text-diff',
  name: '文本对比',
  description: '对比两段文本的差异，按行或按字符高亮增删。',
  category: 'text',
  icon: 'diff',
  keywords: ['diff', 'compare', 'difference', '对比', '比较', '差异', '变更'],
  featured: true,
  about:
    '把两段文本放在一起找出差异：改了哪一行、加了什么、删了什么。按行对比适合代码和配置文件，' +
    '按字符对比适合找出一句话里改动的那几个字。常用于核对两份配置、两版文案、或者接口返回有没有变化。',
  faq: [
    {
      q: '按行和按字符该选哪个？',
      a: '结构化内容（代码、JSON、配置）用按行，能看清是哪一行变了；散文和短句用按字符，能精确到改了哪个词。',
    },
    {
      q: '能对比文件吗？',
      a: '目前只支持粘贴文本。把文件内容复制进来即可，处理全在本地完成。',
    },
  ],
};

export default meta;
