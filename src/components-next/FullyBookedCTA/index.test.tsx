import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

import FullyBookedCTA from './index';
import {
  FullyBookedStatusProvider,
  useFullyBookedStatus,
} from '@/src/components-next/FullyBookedStatus';

const mockTrackEvent = vi.fn();
vi.mock('@/src/components-next/Clarity/track', () => ({
  trackEvent: (name: string, tags?: Record<string, string>) =>
    mockTrackEvent(name, tags),
}));

beforeEach(() => {
  mockTrackEvent.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderWithProvider(ui: React.ReactElement) {
  return render(<FullyBookedStatusProvider>{ui}</FullyBookedStatusProvider>);
}

describe('FullyBookedCTA', () => {
  describe('semantics and accessibility', () => {
    it('renders as a <button>, not an anchor', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      const btn = container.querySelector('button');
      expect(btn).not.toBeNull();
      expect(container.querySelector('a')).toBeNull();
    });

    it('has type="button"', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      expect(container.querySelector('button')?.getAttribute('type')).toBe('button');
    });

    it('has aria-disabled="true"', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      expect(container.querySelector('button')?.getAttribute('aria-disabled')).toBe('true');
    });

    it('does not have the HTML disabled attribute', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      const btn = container.querySelector('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
      expect(btn.hasAttribute('disabled')).toBe(false);
    });

    it('exposes the locked aria-label', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      expect(container.querySelector('button')?.getAttribute('aria-label')).toBe(
        'Fully booked. Not taking new engagements right now.',
      );
    });

    it('renders the visible struck-through "Book a Call" text inside an aria-hidden wrapper', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      const struck = container.querySelector('[aria-hidden="true"]');
      expect(struck).not.toBeNull();
      expect(struck?.textContent).toContain('Book a Call');
    });

    it('renders the visible "Fully Booked" replacement text', () => {
      const { container } = renderWithProvider(<FullyBookedCTA source="header" />);
      expect(container.textContent).toContain('Fully Booked');
    });
  });

  describe('analytics', () => {
    it('fires trackEvent("fully_booked_click", { source }) on click', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="homepage_hero" />,
      );
      fireEvent.click(container.querySelector('button')!);
      expect(mockTrackEvent).toHaveBeenCalledWith('fully_booked_click', {
        source: 'homepage_hero',
      });
    });

    it('fires trackEvent("fully_booked_hover", { source }) on first mouseenter', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="ai_quality_pricing_t1" />,
      );
      fireEvent.mouseEnter(container.querySelector('button')!);
      expect(mockTrackEvent).toHaveBeenCalledWith('fully_booked_hover', {
        source: 'ai_quality_pricing_t1',
      });
    });

    it('does not re-fire hover on the same element within the same session', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="header" />,
      );
      const btn = container.querySelector('button')!;
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
      fireEvent.mouseEnter(btn);
      const hoverCalls = mockTrackEvent.mock.calls.filter(
        (c) => c[0] === 'fully_booked_hover',
      );
      expect(hoverCalls).toHaveLength(1);
    });

    it('does not navigate on click (no href, click fires no navigation)', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="header" />,
      );
      const btn = container.querySelector('button')!;
      // A button has no href; the click handler must not throw and must not
      // attempt navigation. We simply assert that after click, the document
      // has not changed location (jsdom does not do real nav, but absence of
      // href on the element is the structural guarantee).
      expect(btn.getAttribute('href')).toBeNull();
      fireEvent.click(btn);
      expect(window.location.pathname).toBe('/');
    });
  });

  describe('status announcement', () => {
    it('writes the leader/founder status message to the FullyBookedStatus context on click', async () => {
      const captured: string[] = [];
      const Probe = () => {
        const { value } = useFullyBookedStatus();
        captured.push(value);
        return null;
      };
      const { container } = renderWithProvider(
        <>
          <FullyBookedCTA source="founders_hero" />
          <Probe />
        </>,
      );
      await act(async () => {
        fireEvent.click(container.querySelector('button')!);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      });
      const last = captured[captured.length - 1];
      expect(last).toContain("We're fully booked right now");
      expect(last).toContain('The Shift');
    });
  });

  describe('variants', () => {
    it('accepts variant="primary" (default)', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="header" />,
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toMatch(/primary/i);
    });

    it('accepts variant="inverted"', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="header" variant="inverted" />,
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toMatch(/inverted/i);
    });

    it('accepts size="large"', () => {
      const { container } = renderWithProvider(
        <FullyBookedCTA source="homepage_hero" size="large" />,
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toMatch(/large/i);
    });
  });
});
