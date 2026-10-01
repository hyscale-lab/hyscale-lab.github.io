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
await page.goto(`${base}/publications/?tag=cloud-systems&tag=open-source`);
check('two tags → papers with both', (await visible('[data-item]')) === 3, `${await visible('[data-item]')} shown`);
check('chips reflect URL', (await page.locator('[data-filter-tag="open-source"][aria-pressed=true]').count()) === 1);

await page.goto(`${base}/publications/?author=jooyoung-park`);
const jp = await visible('[data-item]');
check('author filter', jp === 3, `${jp} shown`);

await page.goto(`${base}/publications/`);
const total = await visible('[data-item]');
await page.fill('[data-filter-q]', 'serverlessllm');
await page.waitForTimeout(300);
check('search', (await visible('[data-item]')) === 1, `${await visible('[data-item]')} of ${total}`);
check('search kept in URL', page.url().includes('q=serverlessllm'));
await page.locator('[data-filter-clear]:visible').first().click();
check('clear filters', (await visible('[data-item]')) === total);

await page.locator('[data-filter-tag="security"]').click();
check('tag chip click', (await visible('[data-item]')) === 2 && page.url().includes('tag=security'));
await page.locator('[data-filter-tag="security"]').click();

// In-entry tag link filters in place.
await page.locator('a[data-tag-link="ml-for-systems"]').first().click();
check('tag link filters in place', page.url().includes('tag=ml-for-systems') && (await visible('[data-item]')) === 1);

// Bib toggle + year groups hide when empty.
await page.goto(`${base}/publications/?year=2024`);
check('year filter hides other years', (await visible('[data-group]')) === 1);
const bibBtn = page.locator('[data-item]:visible button[aria-controls$="-bib"]').first();
await bibBtn.click();
check('Bib opens', (await page.locator('[id$="-bib"]:visible').count()) === 1);
const bib = await page.locator('[id$="-bib"]:visible pre').innerText();
check('Bib hides site-only fields', !/research_|google_scholar_id|tags =|selected/.test(bib));

// People tabs open from the URL hash.
await page.goto(`${base}/people/#alumni`);
await page.waitForTimeout(300);
check('#alumni opens the Alumni tab', await page.locator('#alumni').isVisible());

// Research → pillar → project pages.
for (const path of [
  '/research/',
  '/research/serverless/',
  '/research/serverless/vhive/',
  '/research/serverless/invitro/',
  '/research/agentic/aries/',
]) {
  const res = await page.goto(`${base}${path}`);
  check(`${path} renders`, res?.status() === 200 && (await page.locator('h1').count()) === 1);
}
await page.goto(`${base}/research/`);
check('pillars link their projects', (await page.locator('a[href="/research/agentic/aries/"]').count()) > 0);

// Landing page carousels.
await page.goto(`${base}/`);
const os = page.locator('[data-carousel]').first();
const current = () => os.locator('[data-dot][aria-current=true]').getAttribute('data-dot');
check('open-source carousel has 3 slides', (await os.locator('[data-slide]').count()) === 3);
await os.scrollIntoViewIfNeeded();
await os.locator('[data-next]').click();
await page.waitForTimeout(600);
check('next → slide 2', (await current()) === '1');
await os.locator('[data-dot="2"]').click();
await page.waitForTimeout(600);
check('dot → slide 3', (await current()) === '2');
await os.locator('[data-next]').click();
await page.waitForTimeout(600);
check('next wraps to slide 1', (await current()) === '0');
check('off-screen slides are inert', (await os.locator('[data-slide][inert]').count()) === 2);
await os.locator('[data-track]').evaluate((t) => t.scrollTo({ left: t.clientWidth }));
await page.waitForTimeout(500);
check('swipe/scroll updates dots', (await current()) === '1');
const team = page.locator('[data-carousel]').nth(1);
check('team carousel has photos', (await team.locator('[data-slide] img').count()) >= 1);

// Autoplay advances on its own and the pause button stops it.
const auto = await browser.newPage();
await auto.clock.install();
await auto.goto(`${base}/`);
const a0 = auto.locator('[data-carousel]').first();
await a0.scrollIntoViewIfNeeded();
await auto.mouse.move(0, 0);
await auto.clock.runFor(7500);
check('autoplay advances', (await a0.locator('[data-dot][aria-current=true]').getAttribute('data-dot')) === '1');
await a0.locator('[data-pause]').click();
await auto.mouse.move(0, 0);
await auto.clock.runFor(15000);
check('pause stops autoplay', (await a0.locator('[data-dot][aria-current=true]').getAttribute('data-dot')) === '1');
await auto.close();

// Theme toggle persists across navigation.
await page.goto(`${base}/`);
check('light by default', !(await page.evaluate(() => document.documentElement.classList.contains('dark'))));
await page.locator('[data-theme-toggle]').first().click();
await page.goto(`${base}/publications/`);
check('dark persists', await page.evaluate(() => document.documentElement.classList.contains('dark')));

// Blog tag filter.
await page.goto(`${base}/blog/`);
check('blog lists the published post', (await page.locator('[data-item]').count()) === 1);

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
process.exit(failed ? 1 : 0);
