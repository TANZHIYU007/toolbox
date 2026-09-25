import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 部署地址相关的唯一两处配置：
//   GitHub Pages 子路径部署 → site + base（当前配置）
//   换成自定义域名时       → site 改成 'https://your-domain.com'，base 改成 '/'
// 其余代码统一通过 src/lib/base.ts 的 withBase() 拼链接，改这里就够了。
export default defineConfig({
  site: 'https://tanzhiyu007.github.io',
  base: '/toolbox',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
