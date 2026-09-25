# 工具箱

一个纯前端小工具集合。所有计算都在浏览器本地完成，不上传任何数据，断网也能用。

**在线地址**：https://tanzhiyu007.github.io/toolbox/

## 它跟别的工具站不一样的地方

首页有一个**智能输入框**：把任何东西粘进去 —— JWT、时间戳、JSON、Base64、颜色值 ——
它会自动识别格式并推荐对应的工具，点一下就带着内容跳过去，落地即是结果。
不用先在几十个工具里找自己要哪个。

另外全站支持 `Ctrl/Cmd + K` 命令面板，模糊搜索所有工具。

## 技术栈

| 选型 | 原因 |
|---|---|
| **Astro 7** | 每个工具生成一个独立的预渲染静态页面，有自己的 title / description / 正文，搜索引擎能抓到内容。纯 SPA 做不到这点。 |
| **React 19（岛屿模式）** | 只有真正需要交互的部分才下载和执行 JS，页面的静态部分零 JS 开销。 |
| **Tailwind CSS 4** | 所有颜色走 CSS 变量令牌，深浅色主题只需改一处。 |
| **TypeScript** | 工具元信息有类型约束，写错图标名、分类名在编译期就报错。 |

> 注：TypeScript 固定在 6.x，因为 `@astrojs/check` 暂不支持 TS 7。等它跟进后可以直接升。

## 架构：为什么加新工具很容易

核心是 `src/tools/registry.ts` 这张**自动注册表**。它用 `import.meta.glob`
扫描 `src/tools/*/meta.ts`，于是下面这些全部由注册表驱动、自动生成：

- 工具详情页路由（`/tools/<id>`）和它的静态 SEO 标签
- 首页的工具网格和分类筛选
- 命令面板的搜索索引
- 首页智能输入框的识别逻辑
- `sitemap-index.xml`
- 冒烟测试的覆盖范围

**所以新增一个工具只需要建一个文件夹，不用改任何中心文件。**

每个工具目录有两个约定文件：

```
src/tools/<id>/
├── meta.ts     # 纯数据：名称、描述、关键词、detect() 识别函数
└── Tool.tsx    # React 组件：真正的交互界面
```

分成两个文件是有原因的：`meta.ts` 会在**构建期**被引入用来生成静态页面，
所以它必须是纯数据 + 纯函数，不能碰 `window`、不能 import React 组件。
`Tool.tsx` 则通过 `React.lazy` **按需加载** —— 每个工具打成独立 chunk，
访问哪个才下载哪个，加到 100 个工具首屏体积也不会变。

```
src/
├── tools/
│   ├── registry.ts        # 自动注册表（中枢，一般不用动）
│   ├── types.ts           # ToolMeta 类型定义
│   ├── categories.ts      # 分类清单
│   └── <id>/              # 一个工具一个文件夹
├── components/
│   ├── ui/                # 共用原语：IOArea / Button / ResultRow / Segmented…
│   ├── ToolHost.tsx       # 按 id 懒加载工具组件
│   ├── CommandPalette.tsx # Ctrl+K 搜索
│   ├── SmartInput.tsx     # 首页智能识别
│   └── icons.ts           # 图标登记处
├── lib/                   # hooks、编解码、剪贴板、base 路径处理
├── layouts/BaseLayout.astro
├── pages/
│   ├── index.astro
│   └── tools/[id].astro   # 动态路由，由注册表生成全部静态页
└── styles/global.css      # 设计令牌（改配色只改这里）
```

## 新增一个工具

以「文本反转」为例，三步：

**1. 建目录** `src/tools/text-reverse/`

**2. 写 `meta.ts`**

```ts
import type { ToolMeta } from '../types';

const meta: ToolMeta = {
  id: 'text-reverse',        // 必须等于文件夹名，也是 URL
  name: '文本反转',
  description: '把一段文本按字符倒序排列。',
  category: 'text',          // 见 categories.ts
  icon: 'braces',            // 见 components/icons.ts
  keywords: ['reverse', '反转', '倒序'],

  // 可选：出现在详情页正文，对 SEO 有帮助
  about: '……',
  faq: [{ q: '……', a: '……' }],

  // 可选：让首页的智能输入框能认出这类内容
  detect(input) {
    if (!looksLikeMyFormat(input)) return null;
    return { score: 0.8, hint: '看起来是…，可以…' };
  },
};

export default meta;
```

**3. 写 `Tool.tsx`**

```tsx
import IOArea from '../../components/ui/IOArea';
import { useToolInput } from '../../lib/hooks';

export default function TextReverseTool() {
  const [input, setInput] = useToolInput('');   // 自动接收首页带过来的内容
  const output = [...input].reverse().join('');

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <IOArea label="输入" value={input} onChange={setInput} />
      <IOArea label="结果" value={output} readOnly />   {/* 只读会自动带复制按钮 */}
    </div>
  );
}
```

完事。路由、首页卡片、搜索索引、sitemap、冒烟测试全部自动包含它。

**可直接复用的 UI 原语**（`src/components/ui/`）：

| 组件 | 用途 |
|---|---|
| `IOArea` | 带标签、字数、复制按钮的文本框。输入输出都用它 |
| `ResultRow` | 「字段名 → 值 → 复制」一行，多结果输出用 |
| `Segmented` | 互斥模式切换（编码/解码） |
| `Toggle` / `Field` / `Button` / `Panel` | 开关、选项行、按钮、卡片 |

**可直接复用的 hooks**（`src/lib/hooks.ts`）：
`useToolInput`（自动接收跨页内容）、`useCopy`、`useDebounced`、`useLocalStorage`（记住用户选项）。

重依赖（图片处理、代码高亮之类）**一律用动态 `import()`**，参考 `src/tools/qrcode/Tool.tsx`，
这样不会拖累其他页面的首屏。

## 开发

```bash
npm install
npm run dev        # http://localhost:4321/toolbox/
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建产物
npm run check      # TypeScript + Astro 类型检查
```

冒烟测试（会自动遍历每个已注册的工具，验证页面能打开、能水合、无报错）：

```bash
npm i -D playwright && npx playwright install chromium
npm run preview &
npm run test:smoke
```

## 部署

推到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

**首次启用**：仓库 Settings → Pages → Source 选 **GitHub Actions**（不是 Deploy from a branch）。

**换自定义域名**时只需改两处：

1. `astro.config.mjs` 里 `site` 改成你的域名、`base` 改成 `'/'`
2. `public/robots.txt` 里的 sitemap 地址

站内所有链接都走 `src/lib/base.ts` 的 `withBase()`，所以不用逐个文件改。

## 后续想加的工具

正则测试、文本 Diff、Cron 表达式解析、Markdown 预览、图片压缩、
进制转换、大小写/命名风格转换、Unicode 转义、YAML ↔ JSON、MD5（需引入实现）。

## License

MIT
