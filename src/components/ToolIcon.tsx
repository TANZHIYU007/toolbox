import { icons, type IconName } from './icons';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

/**
 * 普通 React 组件，没有状态。
 * 在 .astro 里用它会被静态渲染成内联 SVG（零 JS），在 React 岛屿里也能直接用。
 */
export default function ToolIcon({ name, size = 20, className }: Props) {
  const Glyph = icons[name];
  return <Glyph size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
