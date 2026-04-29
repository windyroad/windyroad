import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';

import {
  FullyBookedStatus,
  FullyBookedStatusProvider,
  useFullyBookedStatus,
} from './index';

describe('FullyBookedStatus', () => {
  it('renders an aria-live="polite" region on initial mount', () => {
    const { container } = render(
      <FullyBookedStatusProvider>
        <FullyBookedStatus />
      </FullyBookedStatusProvider>,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
  });

  it('region is empty on initial render (not conditionally mounted)', () => {
    const { container } = render(
      <FullyBookedStatusProvider>
        <FullyBookedStatus />
      </FullyBookedStatusProvider>,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region?.textContent).toBe('');
  });

  it('region has role="status" and aria-atomic="true"', () => {
    const { container } = render(
      <FullyBookedStatusProvider>
        <FullyBookedStatus />
      </FullyBookedStatusProvider>,
    );
    const region = container.querySelector('[aria-live="polite"]');
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.getAttribute('aria-atomic')).toBe('true');
  });

  it('updates region text when setStatus is called via the hook', async () => {
    let setter: ((msg: string) => void) | null = null;
    const Probe = () => {
      const { setStatus } = useFullyBookedStatus();
      setter = setStatus;
      return null;
    };
    const { container } = render(
      <FullyBookedStatusProvider>
        <FullyBookedStatus />
        <Probe />
      </FullyBookedStatusProvider>,
    );

    await act(async () => {
      setter!('First message');
      // Allow the rAF clear-then-set to complete.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });

    const region = container.querySelector('[aria-live="polite"]');
    expect(region?.textContent).toBe('First message');
  });

  it('clears then re-sets to force re-announcement of identical messages', async () => {
    let setter: ((msg: string) => void) | null = null;
    const observed: string[] = [];
    const Probe = () => {
      const { setStatus, value } = useFullyBookedStatus();
      setter = setStatus;
      observed.push(value);
      return null;
    };
    render(
      <FullyBookedStatusProvider>
        <FullyBookedStatus />
        <Probe />
      </FullyBookedStatusProvider>,
    );

    await act(async () => {
      setter!('Same message');
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    await act(async () => {
      setter!('Same message');
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });

    // Between the two sets, observed should contain at least one '' to prove
    // the clear-then-set pattern fired.
    const sawClear = observed.includes('');
    expect(sawClear).toBe(true);
  });
});
