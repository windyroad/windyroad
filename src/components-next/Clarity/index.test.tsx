import { describe, expect, it } from 'vitest';
import { shouldRecordClarity } from './index';

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
