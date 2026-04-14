import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
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
    { text: 'Nov 2026 or later', probability: 0.28, midpoint: 1794576000000 },
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
      expect(srText?.textContent).toMatch(/62%.*arrival/);
      expect(srText?.textContent).toMatch(/Jul/);
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

  describe('probability slider', () => {
    it('renders a percentage-based range input', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
        expect(slider?.getAttribute('min')).toBe('0');
        expect(slider?.getAttribute('max')).toBe('100');
        expect(slider?.getAttribute('step')).toBe('1');
      });
    });

    it('has an accessible label', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
        const sliderId = slider?.getAttribute('id');
        expect(sliderId).toBeTruthy();
        const label = container.querySelector(`label[for="${sliderId}"]`);
        expect(label).not.toBeNull();
      });
    });

    it('defaults to the 50% cumulative probability bucket', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      // Cumulative: Apr=5%, May=17%, Jun=49%, Jul=62%
      // 50% threshold: first bucket where cumulative >= 0.5 is Jul (62%)
      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
        expect((slider as HTMLInputElement).value).toBe('62');
      });
    });

    it('has aria-valuetext with month and cumulative probability', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
        const valueText = slider?.getAttribute('aria-valuetext');
        expect(valueText).toMatch(/Jul 2026/);
        expect(valueText).toMatch(/62%/);
      });
    });

    it('updates countdown when slider value changes', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
      });

      const slider = container.querySelector('input[type="range"]')!;
      act(() => {
        // Slide to 72% (snaps to Aug 2026, cumulative 72%)
        fireEvent.change(slider, { target: { value: '72' } });
      });

      await waitFor(() => {
        const text = container.textContent || '';
        expect(text).toMatch(/Aug 2026/);
      });
    });

    it('updates aria-valuetext when slider value changes', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
      });

      const slider = container.querySelector('input[type="range"]')!;
      act(() => {
        // Slide to 3% (snaps to Apr 2026, cumulative 5%)
        fireEvent.change(slider, { target: { value: '3' } });
      });

      await waitFor(() => {
        const valueText = slider.getAttribute('aria-valuetext');
        expect(valueText).toMatch(/Apr 2026/);
        expect(valueText).toMatch(/5%/);
      });
    });

    it('renders slider in reduced-motion mode too', async () => {
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
        const slider = container.querySelector('input[type="range"]');
        expect(slider).not.toBeNull();
      });
    });

    it('renders dot indicators at each stop position', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const dotContainer = container.querySelector('[class*="sliderDots"]');
        expect(dotContainer).not.toBeNull();
        const dots = dotContainer!.querySelectorAll('span');
        expect(dots.length).toBe(5);
        // Dots positioned at cumulative probabilities: 5%, 17%, 49%, 62%, 72%
        expect(dots[0].style.left).toBe('5%');
        expect(dots[2].style.left).toBe('49%');
        expect(dots[4].style.left).toBe('72%');
      });
    });

    it('filters out catch-all "or later" bucket', async () => {
      mockFetchSuccess();
      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        const text = container.textContent || '';
        // "Nov 2026 or later" should not appear anywhere
        expect(text).not.toMatch(/or later/i);
      });
    });

    it('does not render slider when market has expired', async () => {
      const pastResponse = {
        ...mockManifoldResponse,
        answers: [
          { text: 'Jan 2025', probability: 0.50, midpoint: 1737331200000 },
        ],
      };
      mockFetchSuccess(pastResponse);

      const { container } = render(<Countdown manifoldSlug={MANIFOLD_SLUG} />);

      await waitFor(() => {
        expect(container.textContent).toMatch(/window is open/i);
      });

      const slider = container.querySelector('input[type="range"]');
      expect(slider).toBeNull();
    });
  });
});
