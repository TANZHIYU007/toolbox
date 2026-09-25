import type { CategoryId, DetectResult, ToolMeta } from './types';
import { categories } from './categories';

/**
 * 工具注册表 —— 整个项目的中枢。
 *
 * 用 import.meta.glob 自动收集 src/tools/<id>/meta.ts，所以：
 *   新增一个工具 = 新建一个文件夹（meta.ts + Tool.tsx），不需要改这个文件，
 *   也不需要改路由、首页、命令面板、sitemap —— 它们全部由注册表驱动。
 *
 * eager: true 是故意的：元信息很小，而且构建期生成静态页面和 sitemap 时必须同步拿到。
 * 真正的重头（工具组件本身）在 ToolHost.tsx 里按需懒加载，不会进首屏。
 */
const modules = import.meta.glob<{ default: ToolMeta }>('./*/meta.ts', { eager: true });

function load(): ToolMeta[] {
  const list: ToolMeta[] = [];

  for (const [path, mod] of Object.entries(modules)) {
    const folder = path.split('/')[1]!;
    const meta = mod.default;

    if (!meta) {
      throw new Error(`[registry] ${path} 缺少 default 导出`);
    }
    // 早失败好过线上 404：id 必须和文件夹名一致，否则路由和组件对不上
    if (meta.id !== folder) {
      throw new Error(`[registry] ${path} 的 id ("${meta.id}") 必须等于文件夹名 ("${folder}")`);
    }
    list.push(meta);
  }

  const order = new Map(categories.map((c, i) => [c.id, i]));
  return list.sort((a, b) => {
    const byCategory = (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99);
    return byCategory !== 0 ? byCategory : a.name.localeCompare(b.name, 'zh-Hans-CN');
  });
}

export const tools: ToolMeta[] = load();

export const toolMap: Map<string, ToolMeta> = new Map(tools.map((t) => [t.id, t]));

export function getTool(id: string): ToolMeta | undefined {
  return toolMap.get(id);
}

export function featuredTools(): ToolMeta[] {
  return tools.filter((t) => t.featured);
}

export function toolsByCategory(): { category: CategoryId; name: string; tools: ToolMeta[] }[] {
  return categories
    .map((c) => ({
      category: c.id,
      name: c.name,
      tools: tools.filter((t) => t.category === c.id),
    }))
    .filter((group) => group.tools.length > 0);
}

/* ------------------------------------------------------------------ */
/* 搜索：命令面板（Ctrl/Cmd + K）用                                    */
/* ------------------------------------------------------------------ */

/** 子序列匹配，支持 "jsf" 命中 "json-format" 这种缩写输入 */
function subsequenceScore(haystack: string, needle: string): number {
  let hi = 0;
  let hits = 0;
  let streak = 0;
  let best = 0;

  for (const ch of needle) {
    const found = haystack.indexOf(ch, hi);
    if (found === -1) return 0;
    streak = found === hi ? streak + 1 : 1;
    best = Math.max(best, streak);
    hits += 1;
    hi = found + 1;
  }
  return hits === needle.length ? 0.4 + (best / needle.length) * 0.3 : 0;
}

export interface SearchHit {
  tool: ToolMeta;
  score: number;
}

export function searchTools(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools.map((tool) => ({ tool, score: 1 }));

  const hits: SearchHit[] = [];

  for (const tool of tools) {
    const name = tool.name.toLowerCase();
    const id = tool.id.toLowerCase();
    const keywords = tool.keywords.map((k) => k.toLowerCase());
    const description = tool.description.toLowerCase();

    let score = 0;
    if (name === q || id === q) score = 3;
    else if (name.startsWith(q) || id.startsWith(q)) score = 2.5;
    else if (name.includes(q) || id.includes(q)) score = 2;
    else if (keywords.some((k) => k === q)) score = 1.8;
    else if (keywords.some((k) => k.includes(q))) score = 1.4;
    else if (description.includes(q)) score = 1;
    else score = Math.max(subsequenceScore(id, q), subsequenceScore(name, q));

    if (score > 0) hits.push({ tool, score });
  }

  return hits.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name, 'zh-Hans-CN'));
}

/* ------------------------------------------------------------------ */
/* 智能识别：首页粘贴一段内容，自动推荐能处理它的工具                   */
/* ------------------------------------------------------------------ */

export interface DetectHit {
  tool: ToolMeta;
  result: DetectResult;
}

export function detectTools(input: string, limit = 4): DetectHit[] {
  const text = input.trim();
  if (text.length === 0) return [];

  const hits: DetectHit[] = [];

  for (const tool of tools) {
    if (!tool.detect) continue;
    let result: DetectResult | null = null;
    try {
      result = tool.detect(text);
    } catch {
      // 某个工具的 detect 写崩了不该拖垮整个首页
      result = null;
    }
    if (result && result.score > 0) hits.push({ tool, result });
  }

  return hits.sort((a, b) => b.result.score - a.result.score).slice(0, limit);
}
