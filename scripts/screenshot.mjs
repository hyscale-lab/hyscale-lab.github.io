// Screenshot pages of a running site:
//   node scripts/screenshot.mjs <baseUrl> <outDir> <path>[@width][:dark] ...
import { chromium } from 'playwright';

const [base, out, ...paths] = process.argv.slice(2);
const browser = await chromium.launch();
for (const spec of paths) {
  const [pw, mode] = spec.split(':');
  const [path, w] = pw.split('@');
  const ctx = await browser.newContext({ viewport: { width: +(w || 1366), height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  if (mode === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager'));
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
  });
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const name = `${out}/${path.replace(/[^a-z0-9]+/gi, '_') || 'home'}${w ? '-' + w : ''}${mode ? '-' + mode : ''}.png`;
  await page.screenshot({ path: name, fullPage: true });
  console.log(name, errors.length ? 'ERRORS: ' + errors.join(' | ') : '');
  await ctx.close();
}
await browser.close();
