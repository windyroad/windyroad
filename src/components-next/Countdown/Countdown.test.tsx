import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import Countdown from './index';

const MANIFOLD_SLUG = 'when-will-a-claude-mythos-previewle';

const mockManifoldResponse = {
  question: 'When will a Claude Mythos Preview-level coding model be available?',
  outcomeType: 'DATE',
  url: 'https://manifold.markets/Robincvgr/when-will-a-claude-mythos-previewle',
  answers: [
    { text: 'Apr 2026', probability: 0.05, midpoint: 1776211200000 },
    { text: 'May 2026', probability: 0.12, midpoint: 1778889600000 },
    { text: 'Jun 2026', probability: 0.32, midpoint: 1781481600000 },
    { text: 'Jul 2026', probability: 0.13, midpoint: 1784160000000 },
    { text: 'Aug 2026', probability: 0.10, midpoint: 1786838400000 },
  ],
};

function mockFetchSuccess(response = mockManifoldResponse) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response),
  }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Countdown', () => {
  it('fetches from Manifold API and renders countdown', async () => {
    mockFetchSuccess();
    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const text = container.textContent || '';
      expect(text).toMatch(/Days/);
      expect(text).toMatch(/Hours/);
      expect(text).toMatch(/Minutes/);
      expect(text).toMatch(/Seconds/);
    });
  });

  it('marks visual countdown grid as aria-hidden', async () => {
    mockFetchSuccess();
    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const hiddenGrid = container.querySelector('[aria-hidden="true"]');
      expect(hiddenGrid).not.toBeNull();
    });
  });

  it('provides visually hidden screen reader text with probability', async () => {
    mockFetchSuccess();
    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const srText = container.querySelector('.sr-only, [class*="srOnly"]');
      expect(srText).not.toBeNull();
      expect(srText?.textContent).toMatch(/32%/);
      expect(srText?.textContent).toMatch(/Jun/);
    });
  });

  it('shows static text when prefers-reduced-motion is set', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })));
    mockFetchSuccess();

    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const text = container.textContent || '';
      expect(text).toMatch(/approximately/i);
      expect(text).toMatch(/days/i);
      expect(text).not.toMatch(/Seconds/);
    });
  });

  it('renders nothing when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      // Component should render nothing after failed fetch
      const text = container.textContent || '';
      expect(text).toBe('');
    });
  });

  it('shows expiry message when best answer date has passed', async () => {
    const pastResponse = {
      ...mockManifoldResponse,
      answers: [
        { text: 'Jan 2025', probability: 0.50, midpoint: 1737331200000 },
        { text: 'Feb 2025', probability: 0.30, midpoint: 1740009600000 },
      ],
    };
    mockFetchSuccess(pastResponse);

    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const text = container.textContent || '';
      expect(text).toMatch(/window is open/i);
    });
  });

  it('has aria-live="polite" on expiry message', async () => {
    const pastResponse = {
      ...mockManifoldResponse,
      answers: [
        { text: 'Jan 2025', probability: 0.50, midpoint: 1737331200000 },
      ],
    };
    mockFetchSuccess(pastResponse);

    const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

    await waitFor(() => {
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).not.toBeNull();
    });
  });
});
