// Browser smoke test against a running site: node scripts/smoke-test.mjs http://localhost:4321
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ` (${extra})` : ''}`);
  if (!ok) failed++;
};
const visible = (sel) => page.locator(`${sel}:visible`).count();

// Publications: filters from the URL, combined with AND.
await page.goto(`${base}/publications/?tag=serverless&tag=open-source`);
check('two tags → papers with both', (await visible('[data-item]')) === 3, `${await visible('[data-item]')} shown`);
check('chips reflect URL', (await page.locator('[data-filter-tag="open-source"][aria-pressed=true]').count()) === 1);

await page.goto(`${base}/publications/?author=jooyoung-park`);
const jp = await visible('[data-item]');
check('author filter', jp === 2, `${jp} shown`);

await page.goto(`${base}/publications/`);
const total = await visible('[data-item]');
await page.fill('[data-filter-q]', 'serverlessllm');
await page.waitForTimeout(300);
check('search', (await visible('[data-item]')) === 1, `${await visible('[data-item]')} of ${total}`);
check('search kept in URL', page.url().includes('q=serverlessllm'));
await page.locator('[data-filter-clear]:visible').first().click();
check('clear filters', (await visible('[data-item]')) === total);

await page.locator('[data-filter-tag="llm-serving"]').click();
check('tag chip click', (await visible('[data-item]')) === 4 && page.url().includes('tag=llm-serving'));
await page.locator('[data-filter-tag="llm-serving"]').click();

// In-entry tag link filters in place.
await page.locator('a[data-tag-link="security"]').first().click();
check('tag link filters in place', page.url().includes('tag=security') && (await visible('[data-item]')) === 2);

// Bib toggle + year groups hide when empty.
await page.goto(`${base}/publications/?year=2024`);
check('year filter hides other years', (await visible('[data-group]')) === 1);
const bibBtn = page.locator('[data-item]:visible button[aria-controls$="-bib"]').first();
await bibBtn.click();
check('Bib opens', (await page.locator('[id$="-bib"]:visible').count()) === 1);
const bib = await page.locator('[id$="-bib"]:visible pre').innerText();
check('Bib hides site-only fields', !/research_|google_scholar_id|tags =|selected/.test(bib));

// Old URLs land on the right People tab.
await page.goto(`${base}/people/former-members/`);
await page.waitForURL(/\/people\/#alumni/);
await page.waitForTimeout(300);
check('former-members → alumni tab', await page.locator('#alumni').isVisible());
await page.goto(`${base}/people/supervisees/`);
await page.waitForURL(/#supervisees/);
await page.waitForTimeout(300);
check('supervisees redirect', await page.locator('#supervisees').isVisible());

// Theme toggle persists across navigation.
await page.goto(`${base}/`);
check('light by default', !(await page.evaluate(() => document.documentElement.classList.contains('dark'))));
await page.locator('[data-theme-toggle]').first().click();
await page.goto(`${base}/publications/`);
check('dark persists', await page.evaluate(() => document.documentElement.classList.contains('dark')));

// Blog tag filter.
await page.goto(`${base}/blog/`);
check('blog page renders', (await page.locator('h1').innerText()).length > 0);

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exit(failed ? 1 : 0);
