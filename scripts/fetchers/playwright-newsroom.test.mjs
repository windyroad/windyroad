import { describe, it, expect } from 'vitest';
import {
  parseArgs,
  buildCacheEntry,
  cacheFilePath,
  cleanOpenAITitle,
  buildRedditItem,
  SUPPORTED_SOURCES,
} from './playwright-newsroom.mjs';

describe('parseArgs', () => {
  it('parses --source and --out flags', () => {
    const args = parseArgs(['--source=openai', '--out=.cache/newsletters']);
    expect(args).toEqual({ source: 'openai', out: '.cache/newsletters' });
  });

  it('defaults --out to .cache/newsletters when omitted', () => {
    const args = parseArgs(['--source=openai']);
    expect(args.source).toBe('openai');
    expect(args.out).toBe('.cache/newsletters');
  });

  it('rejects an unsupported source', () => {
    expect(() => parseArgs(['--source=unknown'])).toThrow(/unsupported source.*unknown/);
  });

  it('rejects when --source is missing', () => {
    expect(() => parseArgs([])).toThrow(/--source is required/);
  });

  it('SUPPORTED_SOURCES includes openai in P014a', () => {
    expect(SUPPORTED_SOURCES).toContain('openai');
  });

  it('SUPPORTED_SOURCES includes reddit-locallama and reddit-ml in P014b', () => {
    expect(SUPPORTED_SOURCES).toContain('reddit-locallama');
    expect(SUPPORTED_SOURCES).toContain('reddit-ml');
  });

  it('parseArgs accepts reddit-locallama', () => {
    expect(parseArgs(['--source=reddit-locallama'])).toEqual({
      source: 'reddit-locallama',
      out: '.cache/newsletters',
    });
  });

  it('parseArgs accepts reddit-ml', () => {
    expect(parseArgs(['--source=reddit-ml'])).toEqual({
      source: 'reddit-ml',
      out: '.cache/newsletters',
    });
  });
});

describe('buildRedditItem', () => {
  it('normalises shreddit-post attributes into the ADR-029 item shape', () => {
    const item = buildRedditItem({
      permalink: '/r/LocalLLaMA/comments/1t6pw92/collected_the_infinity_stones/',
      postTitle: 'Collected the infinity stones',
      createdTimestamp: '2026-05-07T22:39:57.516000+0000',
      score: '1883',
      commentCount: '269',
    });
    expect(item).toEqual({
      title: 'Collected the infinity stones',
      url: 'https://www.reddit.com/r/LocalLLaMA/comments/1t6pw92/collected_the_infinity_stones/',
      date: '2026-05-07',
      summary: '1883 upvotes, 269 comments',
    });
  });

  it('handles posts with missing score or comment count gracefully', () => {
    const item = buildRedditItem({
      permalink: '/r/MachineLearning/comments/abc/test/',
      postTitle: 'Test',
      createdTimestamp: '2026-05-10T00:00:00.000000+0000',
      score: '',
      commentCount: '',
    });
    expect(item.title).toBe('Test');
    expect(item.url).toBe('https://www.reddit.com/r/MachineLearning/comments/abc/test/');
    expect(item.date).toBe('2026-05-10');
    expect(item.summary).toBe('0 upvotes, 0 comments');
  });

  it('throws when permalink is missing', () => {
    expect(() =>
      buildRedditItem({
        permalink: '',
        postTitle: 'Test',
        createdTimestamp: '2026-05-10T00:00:00.000000+0000',
        score: '1',
        commentCount: '1',
      }),
    ).toThrow(/permalink is required/);
  });

  it('throws when postTitle is missing', () => {
    expect(() =>
      buildRedditItem({
        permalink: '/r/x/comments/y/z/',
        postTitle: '',
        createdTimestamp: '2026-05-10T00:00:00.000000+0000',
        score: '1',
        commentCount: '1',
      }),
    ).toThrow(/postTitle is required/);
  });
});

describe('buildCacheEntry', () => {
  const fixedNow = new Date('2026-05-13T09:00:00Z');

  it('shapes the cache entry per the ADR-029 schema', () => {
    const items = [
      {
        title: 'OpenAI Campus Network',
        url: 'https://openai.com/index/openai-campus-network',
        date: '2026-05-12',
        summary: 'Lorem ipsum.',
      },
    ];

    const entry = buildCacheEntry({ source: 'openai-news', items, now: fixedNow });

    expect(entry).toEqual({
      source: 'openai-news',
      fetched_at: '2026-05-13T09:00:00.000Z',
      items: [
        {
          title: 'OpenAI Campus Network',
          url: 'https://openai.com/index/openai-campus-network',
          date: '2026-05-12',
          summary: 'Lorem ipsum.',
        },
      ],
    });
  });

  it('accepts an empty items array (zero-items run is a valid signal)', () => {
    const entry = buildCacheEntry({ source: 'openai-news', items: [], now: fixedNow });
    expect(entry.source).toBe('openai-news');
    expect(entry.fetched_at).toBe('2026-05-13T09:00:00.000Z');
    expect(entry.items).toEqual([]);
  });

  it('throws when source is missing', () => {
    expect(() =>
      buildCacheEntry({ items: [], now: fixedNow }),
    ).toThrow(/source is required/);
  });

  it('throws when items is not an array', () => {
    expect(() =>
      buildCacheEntry({ source: 'openai-news', items: null, now: fixedNow }),
    ).toThrow(/items must be an array/);
  });
});

describe('cleanOpenAITitle', () => {
  it('strips trailing category+date from a raw anchor textContent', () => {
    const raw = 'OpenAI Campus Network: Student club interest formCompanyMay 11, 2026';
    const cleaned = cleanOpenAITitle(raw);
    expect(cleaned.title).toBe('OpenAI Campus Network: Student club interest form');
    expect(cleaned.category).toBe('Company');
    expect(cleaned.date).toBe('2026-05-11');
  });

  it('handles the multi-word "Global Affairs" category', () => {
    const raw = 'Some policy newsGlobal AffairsJune 3, 2026';
    const cleaned = cleanOpenAITitle(raw);
    expect(cleaned.title).toBe('Some policy news');
    expect(cleaned.category).toBe('Global Affairs');
    expect(cleaned.date).toBe('2026-06-03');
  });

  it('handles a Security category with a "Cyber" sub-suffix in the title', () => {
    const raw = 'Scaling Trusted Access for Cyber with GPT-5.5 and GPT-5.5-CyberSecurityMay 7, 2026';
    const cleaned = cleanOpenAITitle(raw);
    expect(cleaned.title).toBe('Scaling Trusted Access for Cyber with GPT-5.5 and GPT-5.5-Cyber');
    expect(cleaned.category).toBe('Security');
    expect(cleaned.date).toBe('2026-05-07');
  });

  it('returns raw title with empty category/date when pattern does not match', () => {
    const raw = 'Plain title with no suffix';
    const cleaned = cleanOpenAITitle(raw);
    expect(cleaned.title).toBe('Plain title with no suffix');
    expect(cleaned.category).toBe('');
    expect(cleaned.date).toBe('');
  });
});

describe('cacheFilePath', () => {
  it('builds .cache/newsletters/<slug>/YYYY-MM-DD.json per ADR-029', () => {
    const when = new Date('2026-05-13T09:00:00Z');
    const path = cacheFilePath('.cache/newsletters', 'openai-news', when);
    expect(path).toBe('.cache/newsletters/openai-news/2026-05-13.json');
  });

  it('uses UTC date so cache paths match the fetched_at day', () => {
    const lateNight = new Date('2026-05-13T23:30:00Z');
    const path = cacheFilePath('.cache/newsletters', 'openai-news', lateNight);
    expect(path).toBe('.cache/newsletters/openai-news/2026-05-13.json');
  });

  it('throws when cacheDir is empty', () => {
    expect(() => cacheFilePath('', 'openai-news', new Date())).toThrow(/cacheDir is required/);
  });

  it('throws when source slug is empty', () => {
    expect(() => cacheFilePath('.cache/newsletters', '', new Date())).toThrow(/source is required/);
  });
});
