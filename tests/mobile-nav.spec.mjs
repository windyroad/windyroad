import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function test() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone sized
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Find and click the hamburger button
  const hamburger = page.locator('button[aria-label="Menu"]');
  await hamburger.waitFor({ state: 'visible' });
  await hamburger.click();

  // Wait a tick for state to update
  await page.waitForTimeout(300);

  // The nav should now be visible
  const nav = page.locator('nav[aria-label="Main"]');
  const navBox = await nav.boundingBox();
  if (!navBox) {
    console.error('FAIL: Nav has no bounding box (not visible)');
    await browser.close();
    process.exit(1);
  }

  // Find a nav link inside the menu
  const foundersLink = page.locator('nav[aria-label="Main"] a:has-text("Founders")');
  const linkBox = await foundersLink.boundingBox();
  if (!linkBox) {
    console.error('FAIL: Founders link has no bounding box');
    await browser.close();
    process.exit(1);
  }

  // THE KEY TEST: Check that the nav link is not obscured by other elements.
  // Use elementFromPoint at the center of the Founders link to see what's on top.
  const centerX = linkBox.x + linkBox.width / 2;
  const centerY = linkBox.y + linkBox.height / 2;

  const topElementTag = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return 'null';
      // Walk up to find the nearest identifiable element
      let current = el;
      while (current) {
        if (current.tagName === 'NAV') return 'NAV';
        if (current.tagName === 'A' && current.closest('nav')) return 'NAV_LINK';
        if (current.tagName === 'SECTION') return `SECTION.${current.className.substring(0, 50)}`;
        if (current.tagName === 'H1') return 'H1';
        if (current.tagName === 'MAIN') return 'MAIN';
        current = current.parentElement;
      }
      return `OTHER:${el.tagName}.${el.className.substring(0, 50)}`;
    },
    { x: centerX, y: centerY }
  );

  // Always take a screenshot for visual verification
  await page.screenshot({ path: '/tmp/mobile-nav-open.png', fullPage: false });
  console.log('Screenshot saved to /tmp/mobile-nav-open.png');

  // Check that the nav covers the full width
  if (navBox.width < 370) {
    console.error(`FAIL: Nav width is ${navBox.width}px -- should cover full viewport (375px)`);
    await browser.close();
    process.exit(1);
  }
  console.log(`PASS: Nav covers full width (${navBox.width}px)`);

  // Check that nav background is opaque by sampling a pixel in the nav area
  // below the links -- it should be dark, not showing hero content through
  const navBgColor = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return 'null';
    const bg = getComputedStyle(el).backgroundColor;
    return bg;
  }, { x: 187, y: navBox.y + navBox.height - 50 });
  console.log(`Nav background color: ${navBgColor}`);

  if (topElementTag === 'NAV' || topElementTag === 'NAV_LINK') {
    console.log(`PASS: Element at nav link center (${centerX}, ${centerY}) is ${topElementTag}`);
  } else {
    console.error(
      `FAIL: Element at nav link center (${centerX}, ${centerY}) is ${topElementTag} -- nav is obscured!`
    );

    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/mobile-nav-fail.png' });
    console.error('Screenshot saved to /tmp/mobile-nav-fail.png');

    await browser.close();
    process.exit(1);
  }

  // Also verify the link is clickable
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    foundersLink.click(),
  ]);

  if (page.url().includes('/founders')) {
    console.log('PASS: Clicking Founders link navigated to /founders');
  } else {
    console.error(`FAIL: Expected /founders URL, got ${page.url()}`);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  console.log('All mobile nav tests passed');
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
