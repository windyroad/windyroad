import { describe, it, expect, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'mock-inter' }),
}));

import RootLayout from './layout';

describe('RootLayout', () => {
  it('exports a default function component', () => {
    expect(typeof RootLayout).toBe('function');
  });

  it('returns a tree containing the FullyBookedStatusProvider', () => {
    const tree = RootLayout({ children: null }) as {
      props: { children: { props: { children: unknown } } };
    };
    // RootLayout renders <html><body>...</body></html>; the body's children
    // should contain at least one element whose displayName / name resolves
    // to the FullyBookedStatusProvider wrapper. We do a stringified search
    // since the component identity is hidden behind 'use client' boundaries.
    const json = JSON.stringify(tree, (_key, value) => {
      if (typeof value === 'function') return value.name || 'Anonymous';
      return value;
    });
    expect(json).toContain('FullyBookedStatusProvider');
    expect(json).toContain('FullyBookedStatus');
  });
});
