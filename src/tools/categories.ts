import type { CategoryId } from './types';
import type { IconName } from '../components/icons';

export interface Category {
  id: CategoryId;
  name: string;
  icon: IconName;
}

/** 数组顺序 = 首页和导航里的展示顺序 */
export const categories: Category[] = [
  { id: 'encode',   name: '编码转换', icon: 'binary' },
  { id: 'text',     name: '文本处理', icon: 'braces' },
  { id: 'time',     name: '时间日期', icon: 'clock' },
  { id: 'crypto',   name: '加密哈希', icon: 'fingerprint' },
  { id: 'generate', name: '生成器',   icon: 'sparkles' },
  { id: 'visual',   name: '颜色图像', icon: 'palette' },
];

export const categoryMap = new Map(categories.map((c) => [c.id, c]));

export function categoryName(id: CategoryId): string {
  return categoryMap.get(id)?.name ?? id;
}
