import { Suspense, lazy, useEffect, type ComponentType } from 'react';
import { pushRecent } from '../lib/recent';

/**
 * 按 id 加载对应工具组件的宿主。
 *
 * 为什么要这么一层：Astro 的 client 指令需要在构建期静态确定组件，
 * 而工具是动态发现的。所以整个站只水合这一个已知组件，真正的代码分割
 * 交给 React.lazy —— 每个工具打成独立的 chunk，访问哪个才下载哪个。
 * 效果是：加 100 个工具也不会拖慢首屏。
 */
const loaders = import.meta.glob<{ default: ComponentType }>('../tools/*/Tool.tsx');

const lazyTools: Record<string, ComponentType> = {};
for (const [path, loader] of Object.entries(loaders)) {
  // '../tools/<id>/Tool.tsx'
  const id = path.split('/')[2]!;
  lazyTools[id] = lazy(loader);
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="加载中">
      <div className="h-4 w-24 rounded bg-surface-2" />
      <div className="h-32 rounded-xl bg-surface-2" />
      <div className="h-4 w-16 rounded bg-surface-2" />
      <div className="h-32 rounded-xl bg-surface-2" />
    </div>
  );
}

export default function ToolHost({ id }: { id: string }) {
  useEffect(() => {
    pushRecent(id);
  }, [id]);

  const Tool = lazyTools[id];

  if (!Tool) {
    return (
      <p className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
        没找到 id 为 <code className="font-mono">{id}</code> 的工具组件。
        检查 <code className="font-mono">src/tools/{id}/Tool.tsx</code> 是否存在。
      </p>
    );
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <Tool />
    </Suspense>
  );
}
