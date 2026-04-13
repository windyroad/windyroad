import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountUp from './index';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((callback: IntersectionObserverCallback) => {
      // Trigger immediately as if element is visible
      callback(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
      return { observe: mockObserve, disconnect: mockDisconnect };
    }),
  );
});

describe('CountUp', () => {
  it('renders the final value', () => {
    render(<CountUp end={400} suffix="%" />);
    expect(screen.getByText('400%')).toBeInTheDocument();
  });

  it('applies prefix and suffix', () => {
    render(<CountUp end={97} prefix="0 \u2192 " suffix="%" />);
    const hiddenSpan = document.querySelector('[aria-hidden="true"]');
    expect(hiddenSpan).toHaveTextContent('0 \u2192 97%');
  });

  it('respects prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    render(<CountUp end={25} suffix="+" />);
    expect(screen.getByText('25+')).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it('accepts a custom className', () => {
    const { container } = render(
      <CountUp end={10} className="test-class" />,
    );
    expect(container.firstChild).toHaveClass('test-class');
  });
});
