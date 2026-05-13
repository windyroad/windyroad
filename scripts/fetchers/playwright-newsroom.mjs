import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const SUPPORTED_SOURCES = ['openai', 'reddit-locallama', 'reddit-ml'];

const SOURCE_SLUGS = {
  openai: 'openai-news',
  'reddit-locallama': 'reddit-locallama',
  'reddit-ml': 'reddit-machinelearning',
};

const SOURCE_URLS = {
  openai: 'https://openai.com/news/',
  'reddit-locallama': 'https://www.reddit.com/r/LocalLLaMA/top/?t=week',
  'reddit-ml': 'https://www.reddit.com/r/MachineLearning/top/?t=week',
};

const DEFAULT_OUT = '.cache/newsletters';
const MAX_ITEMS = 10;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function parseArgs(argv) {
  const parsed = { source: null, out: DEFAULT_OUT };
  for (const arg of argv) {
    if (arg.startsWith('--source=')) {
      parsed.source = arg.slice('--source='.length);
    } else if (arg.startsWith('--out=')) {
      parsed.out = arg.slice('--out='.length);
    }
  }
  if (!parsed.source) {
    throw new Error('--source is required');
  }
  if (!SUPPORTED_SOURCES.includes(parsed.source)) {
    throw new Error(
      `unsupported source: ${parsed.source} (supported: ${SUPPORTED_SOURCES.join(', ')})`,
    );
  }
  return parsed;
}

export function buildCacheEntry({ source, items, now = new Date() }) {
  if (!source) {
    throw new Error('source is required');
  }
  if (!Array.isArray(items)) {
    throw new Error('items must be an array');
  }
  return {
    source,
    fetched_at: now.toISOString(),
    items,
  };
}

const OPENAI_CATEGORIES = [
  'Global Affairs',
  'AI Adoption',
  'Company',
  'Research',
  'Product',
  'Safety',
  'Engineering',
  'Security',
  'Policy',
];

const MONTH_INDEX = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

const TITLE_SUFFIX_PATTERN = new RegExp(
  '^(.*?)(' + OPENAI_CATEGORIES.join('|') + ')(January|February|March|April|May|June|July|August|September|October|November|December) (\\d{1,2}), (\\d{4})$',
);

export function cleanOpenAITitle(raw) {
  const match = TITLE_SUFFIX_PATTERN.exec(raw);
  if (!match) {
    return { title: raw, category: '', date: '' };
  }
  const [, title, category, monthName, day, year] = match;
  const mm = String(MONTH_INDEX[monthName]).padStart(2, '0');
  const dd = String(parseInt(day, 10)).padStart(2, '0');
  return {
    title: title.trim(),
    category,
    date: `${year}-${mm}-${dd}`,
  };
}

export function buildRedditItem({ permalink, postTitle, createdTimestamp, score, commentCount }) {
  if (!permalink) {
    throw new Error('permalink is required');
  }
  if (!postTitle) {
    throw new Error('postTitle is required');
  }
  const scoreNum = parseInt(score, 10);
  const commentsNum = parseInt(commentCount, 10);
  return {
    title: postTitle,
    url: `https://www.reddit.com${permalink}`,
    date: createdTimestamp ? createdTimestamp.slice(0, 10) : '',
    summary: `${Number.isFinite(scoreNum) ? scoreNum : 0} upvotes, ${Number.isFinite(commentsNum) ? commentsNum : 0} comments`,
  };
}

export function cacheFilePath(cacheDir, source, when = new Date()) {
  if (!cacheDir) {
    throw new Error('cacheDir is required');
  }
  if (!source) {
    throw new Error('source is required');
  }
  const yyyy = when.getUTCFullYear();
  const mm = String(when.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(when.getUTCDate()).padStart(2, '0');
  return `${cacheDir}/${source}/${yyyy}-${mm}-${dd}.json`;
}

export async function fetchOpenAINews(page) {
  await page.goto(SOURCE_URLS.openai, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const rawItems = await page.$$eval(
    'a',
    (anchors, max) => {
      const seen = new Set();
      const out = [];
      for (const a of anchors) {
        const href = a.href || '';
        if (!href.startsWith('https://openai.com/index/')) continue;
        if (seen.has(href)) continue;
        seen.add(href);
        const text = (a.textContent || '').trim().replace(/\s+/g, ' ');
        if (!text) continue;
        out.push({ rawText: text, url: href });
        if (out.length >= max) break;
      }
      return out;
    },
    MAX_ITEMS,
  );

  return rawItems.map(({ rawText, url }) => {
    const { title, category, date } = cleanOpenAITitle(rawText);
    return { title, url, date, summary: category };
  });
}

export async function fetchRedditTop(page, subredditUrl) {
  await page.goto(subredditUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Reddit lazy-loads posts; scroll until we have >= MAX_ITEMS shreddit-post elements
  // or until the count stops growing.
  let lastCount = 0;
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1500);
    const count = await page.locator('shreddit-post').count();
    if (count >= MAX_ITEMS || count === lastCount) break;
    lastCount = count;
  }

  const rawPosts = await page.$$eval(
    'shreddit-post',
    (els, max) =>
      els.slice(0, max).map((el) => ({
        permalink: el.getAttribute('permalink') || '',
        postTitle: el.getAttribute('post-title') || '',
        createdTimestamp: el.getAttribute('created-timestamp') || '',
        score: el.getAttribute('score') || '',
        commentCount: el.getAttribute('comment-count') || '',
      })),
    MAX_ITEMS,
  );

  return rawPosts
    .filter((p) => p.permalink && p.postTitle)
    .map((p) => buildRedditItem(p));
}

async function main(argv) {
  const { source, out } = parseArgs(argv);
  const sourceSlug = SOURCE_SLUGS[source];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let items = [];
  let error = null;
  try {
    if (source === 'openai') {
      items = await fetchOpenAINews(page);
    } else if (source === 'reddit-locallama' || source === 'reddit-ml') {
      items = await fetchRedditTop(page, SOURCE_URLS[source]);
    }
  } catch (err) {
    error = err;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  if (error) {
    console.error(`fetch failed: ${error.message}`);
    process.exit(1);
  }

  const now = new Date();
  const entry = buildCacheEntry({ source: sourceSlug, items, now });
  const filePath = cacheFilePath(out, sourceSlug, now);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(entry, null, 2) + '\n', 'utf8');

  console.log(`wrote ${items.length} items to ${filePath}`);
  if (items.length === 0) {
    console.error('warning: zero items extracted; SKILL step 2 will fall through to RSS');
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
