/**
 * 站点部署在子路径（GitHub Pages 的 /toolbox/）时，所有内部链接都要带前缀。
 * Astro 不会自动改写 href 字符串，所以统一走这个函数。
 * 以后换成自定义域名，只改 astro.config.mjs 的 base，这里不动。
 */
const RAW_BASE = import.meta.env.BASE_URL; // '/' 或 '/toolbox/'

export function withBase(path: string): string {
  const prefix = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${suffix}` || '/';
}

/** 工具详情页地址 */
export function toolPath(id: string): string {
  return withBase(`/tools/${id}`);
}
