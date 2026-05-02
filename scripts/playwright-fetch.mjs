import { chromium } from 'playwright';

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('Usage: node scripts/playwright-fetch.mjs <url1> [url2 ...]');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});

for (const url of urls) {
  console.log(`\n===== ${url} =====`);
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const title = await page.title();
    console.log(`TITLE: ${title}`);
    console.log(`FINAL_URL: ${page.url()}`);
    const text = await page.evaluate(() => (document.body.innerText || '').slice(0, 4000));
    console.log('BODY (first 4000 chars):');
    console.log(text);
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  } finally {
    await page.close();
  }
}

await context.close();
await browser.close();
