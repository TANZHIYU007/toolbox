/**
 * 冒烟测试：启动 preview 后跑 `node tests/smoke.mjs`。
 *
 * 会自动遍历 src/tools/ 下的每个工具目录，逐个打开页面，验证：
 *   - 页面能返回并渲染
 *   - React 岛屿成功水合（能找到可交互元素）
 *   - 控制台没有报错
 * 所以新增工具后不需要改这个文件，它自己会覆盖到。
 *
 * 前置：npm i -D playwright && npx playwright install chromium
 * 可用 CHROMIUM_PATH 指定浏览器可执行文件。
 */
import { chromium } from 'playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321/toolbox';
const TOOLS_DIR = new URL('../src/tools/', import.meta.url).pathname;

const toolIds = readdirSync(TOOLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(TOOLS_DIR, e.name, 'meta.ts')))
  .map((e) => e.name)
  .sort();

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

/* ---------- 1. 每个工具页都能打开并水合 ---------- */
console.log(`\n发现 ${toolIds.length} 个工具，逐个检查页面\n`);

for (const id of toolIds) {
  const before = consoleErrors.length;
  const response = await page.goto(`${BASE}/tools/${id}/`, { waitUntil: 'networkidle' });

  const status = response?.status() ?? 0;
  // 标题来自静态 HTML（SEO 需要），可交互元素来自水合后的 React 岛屿
  const hasHeading = (await page.locator('h1').count()) > 0;
  const hydrated = await page
    .locator('textarea, input, button[role="switch"], [role="tablist"]')
    .first()
    .waitFor({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  const clean = consoleErrors.length === before;

  check(`${id.padEnd(12)} 页面 ${status} / 标题 / 水合 / 无报错`,
    status === 200 && hasHeading && hydrated && clean,
    clean ? '' : consoleErrors.slice(before).join(' | '));
}

/* ---------- 2. 首页智能识别 ---------- */
console.log('\n核心链路\n');
const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsIm5hbWUiOiJaaGFuZyBTYW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.Xk3s7YQ1bW9vZ2xlX3NpZ25hdHVyZV9kZW1v';

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.fill('textarea', JWT);
await page.waitForTimeout(400);
const suggestion = await page.locator('ul li button').first().innerText().catch(() => '');
check('首页识别出 JWT 并推荐工具', suggestion.includes('JWT'), suggestion.replace(/\n/g, ' | '));

await page.locator('ul li button').first().click();
await page.waitForURL(/tools\/jwt-decode/, { timeout: 5000 }).catch(() => {});
await page.waitForSelector('textarea');
await page.waitForTimeout(300);
check('内容跨页带入目标工具', (await page.locator('textarea').first().inputValue()) === JWT);
check('JWT 载荷解码正确',
  (await page.locator('textarea').nth(2).inputValue()).includes('Zhang San'));

/* ---------- 3. 命令面板 ---------- */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.keyboard.press('Control+k');
await page.waitForTimeout(300);
check('Ctrl+K 打开命令面板', await page.locator('[role="dialog"]').isVisible());
await page.keyboard.type('base');
await page.waitForTimeout(250);
await page.keyboard.press('Enter');
const navigated = await page.waitForURL(/tools\/base64/, { timeout: 5000 }).then(() => true).catch(() => false);
check('搜索后回车跳转', navigated);

/* ---------- 4. 几个容易出错的计算 ---------- */
await page.waitForSelector('textarea');
await page.locator('textarea').first().fill('你好，工具箱！🧰');
await page.waitForTimeout(300);
const encoded = await page.locator('textarea').nth(1).inputValue();
await page.getByRole('tab', { name: '解码' }).click();
await page.locator('textarea').first().fill(encoded);
await page.waitForTimeout(300);
check('中文 / emoji Base64 往返一致',
  (await page.locator('textarea').nth(1).inputValue()) === '你好，工具箱！🧰', encoded);

await page.goto(`${BASE}/tools/hash/`, { waitUntil: 'networkidle' });
await page.waitForSelector('textarea');
await page.locator('textarea').first().fill('abc');
await page.waitForTimeout(600);
check('SHA-256("abc") 结果正确',
  (await page.innerText('body')).includes('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));

await page.goto(`${BASE}/tools/qrcode/`, { waitUntil: 'networkidle' });
await page.waitForSelector('textarea');
await page.locator('textarea').first().fill('https://example.com');
await page.waitForTimeout(1500);
check('二维码按需加载并生成', (await page.locator('img[alt="生成的二维码"]').count()) === 1);

/* ---------- 5. 主题切换 ---------- */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const themeBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));
await page.click('#theme-toggle');
await page.waitForTimeout(200);
const themeAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
check('主题切换并持久化', themeBefore !== themeAfter &&
  (await page.evaluate(() => localStorage.getItem('toolbox:theme'))) !== null);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} 通过`);
if (failed.length > 0) {
  console.log('失败项：' + failed.map((f) => f.name).join(', '));
  process.exit(1);
}
