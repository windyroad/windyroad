import { describe, expect, it } from 'vitest';
import { applyAnalyticsPreference, shouldRecordClarity } from './index';

describe('shouldRecordClarity', () => {
  it.each([
    'localhost',
    '127.0.0.1',
    '::1',
    '[::1]',
    'release-pr-39--windyroad.netlify.app',
  ])('does not record non-production host %s', (hostname) => {
    expect(shouldRecordClarity(hostname)).toBe(false);
  });

  it.each(['windyroad.com.au', 'www.windyroad.com.au'])(
    'records production host %s',
    (hostname) => {
      expect(shouldRecordClarity(hostname)).toBe(true);
    },
  );
});

describe('applyAnalyticsPreference', () => {
  it('persists opt-out until the browser is explicitly opted back in', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    const optOutUrl = new URL('https://windyroad.com.au/?analytics=off');

    expect(applyAnalyticsPreference(optOutUrl, storage)).toBe(false);
    expect(optOutUrl.search).toBe('');
    expect(
      applyAnalyticsPreference(new URL('https://windyroad.com.au/'), storage),
    ).toBe(false);

    const optInUrl = new URL('https://windyroad.com.au/?analytics=on');
    expect(applyAnalyticsPreference(optInUrl, storage)).toBe(true);
    expect(optInUrl.search).toBe('');
  });

  it('keeps the opt-out parameter when browser storage is unavailable', () => {
    const url = new URL('https://windyroad.com.au/?analytics=off');
    const unavailableStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage unavailable');
      },
      removeItem: () => {},
    };

    expect(applyAnalyticsPreference(url, unavailableStorage)).toBe(false);
    expect(url.searchParams.get('analytics')).toBe('off');
  });
});
