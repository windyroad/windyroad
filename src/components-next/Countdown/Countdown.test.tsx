import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import Countdown from './index';

const FUTURE_DATE = '2026-06-30';
const PAST_DATE = '2020-01-01';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-14T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Countdown', () => {
  it('renders days/hours/minutes/seconds for a future date', () => {
    const { container } = render(
      <Countdown targetDate={FUTURE_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const text = container.textContent || '';
    expect(text).toMatch(/Days/);
    expect(text).toMatch(/Hours/);
    expect(text).toMatch(/Minutes/);
    expect(text).toMatch(/Seconds/);
  });

  it('marks visual countdown grid as aria-hidden', () => {
    const { container } = render(
      <Countdown targetDate={FUTURE_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const hiddenGrid = container.querySelector('[aria-hidden="true"]');
    expect(hiddenGrid).not.toBeNull();
  });

  it('provides visually hidden screen reader text', () => {
    const { container } = render(
      <Countdown targetDate={FUTURE_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const srText = container.querySelector('.sr-only, [class*="srOnly"]');
    expect(srText).not.toBeNull();
    expect(srText?.textContent).toMatch(/23%/);
    expect(srText?.textContent).toMatch(/June 30/);
  });

  it('shows static text when prefers-reduced-motion is set', () => {
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

    const { container } = render(
      <Countdown targetDate={FUTURE_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const text = container.textContent || '';
    expect(text).toMatch(/approximately/i);
    expect(text).toMatch(/days/i);
    expect(text).not.toMatch(/Seconds/);

    vi.unstubAllGlobals();
  });

  it('shows expiry message when target date has passed', () => {
    const { container } = render(
      <Countdown targetDate={PAST_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const text = container.textContent || '';
    expect(text).toMatch(/window is open/i);
  });

  it('has aria-live="polite" on expiry message', () => {
    const { container } = render(
      <Countdown targetDate={PAST_DATE} probability={23} sourceUrl="https://polymarket.com" />
    );
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });
});
