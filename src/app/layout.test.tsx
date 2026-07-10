import { describe, it, expect, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'mock-inter' }),
}));

import RootLayout from './layout';

describe('RootLayout', () => {
  it('exports a default function component', () => {
    expect(typeof RootLayout).toBe('function');
  });

  it('renders the main landmark and no retired FullyBookedStatus wrapper', () => {
    const tree = RootLayout({ children: null });
    const json = JSON.stringify(tree, (_key, value) => {
      if (typeof value === 'function') return value.name || 'Anonymous';
      return value;
    });
    expect(json).toContain('main-content');
    expect(json).not.toContain('FullyBookedStatus');
  });
});
