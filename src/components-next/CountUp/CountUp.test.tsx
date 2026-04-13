import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountUp from './index';

describe('CountUp', () => {
  it('renders the final value', () => {
    const { container } = render(<CountUp end={400} suffix="%" />);
    expect(container.textContent).toContain('400%');
  });

  it('applies prefix and suffix', () => {
    const { container } = render(<CountUp end={97} prefix="0 → " suffix="%" />);
    expect(container.textContent).toContain('0 → 97%');
  });

  it('respects prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    render(<CountUp end={25} suffix="+" />);
    const matches = screen.getAllByText('25+');
    expect(matches.length).toBeGreaterThanOrEqual(1);

    vi.unstubAllGlobals();
  });

  it('accepts a custom className', () => {
    const { container } = render(
      <CountUp end={10} className="test-class" />,
    );
    expect(container.firstChild).toHaveClass('test-class');
  });
});
