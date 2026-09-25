import type { IconName } from '../components/icons';

export type CategoryId = 'encode' | 'text' | 'time' | 'crypto' | 'generate' | 'visual';

/** detect() 的返回值：粘贴一段内容时，工具自报「我能处理它吗」 */
export interface DetectResult {
  /** 0~1 置信度。0.9 以上视为「几乎确定」 */
  score: number;
  /** 展示给用户的一句话，如「看起来是一个 JWT，已解析出 3 段」 */
  hint: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * 一个工具的全部元信息。
 *
 * 关键约束：meta.ts 必须是「纯数据 + 纯函数」，不能 import React 组件、
 * 不能有副作用、不能碰 window。因为它会在构建期被 Astro 引入，用来生成
 * 静态页面、SEO 标签和 sitemap。交互逻辑全部放在同目录的 Tool.tsx 里。
 */
export interface ToolMeta {
  /** 必须与所在文件夹名一致，同时也是 URL：/tools/<id> */
  id: string;
  name: string;
  /** 一句话说明。同时用于 <meta name="description"> 和列表卡片 */
  description: string;
  category: CategoryId;
  icon: IconName;
  /** 搜索关键词。中英文都写上，命令面板和 SEO 都吃这个 */
  keywords: string[];
  /** 详情页正文里的长说明。纯静态渲染，对 SEO 有实际帮助 */
  about?: string;
  /** 常见问题，渲染成静态 HTML */
  faq?: FaqItem[];
  /** 首页「常用」区置顶 */
  featured?: boolean;
  /** 智能识别：首页粘贴内容时判断本工具是否适用。不实现就是不参与识别 */
  detect?: (input: string) => DetectResult | null;
}
