import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEvent = vi.fn();
const mockSetTag = vi.fn();

vi.mock('@microsoft/clarity', () => ({
  default: {
    event: (...args: unknown[]) => mockEvent(...args),
    setTag: (...args: unknown[]) => mockSetTag(...args),
  },
}));

beforeEach(() => {
  mockEvent.mockClear();
  mockSetTag.mockClear();
});

describe('trackEvent', () => {
  it('calls clarity.event with the event name', async () => {
    const { trackEvent } = await import('./track');
    trackEvent('fully_booked_click');
    expect(mockEvent).toHaveBeenCalledWith('fully_booked_click');
  });

  it('calls clarity.setTag for each tag before clarity.event', async () => {
    const { trackEvent } = await import('./track');
    trackEvent('fully_booked_click', { source: 'header', extra: 'beta' });
    expect(mockSetTag).toHaveBeenCalledWith('source', 'header');
    expect(mockSetTag).toHaveBeenCalledWith('extra', 'beta');
    expect(mockEvent).toHaveBeenCalledWith('fully_booked_click');
    // setTag must be called before event so the tag is attached.
    const eventOrder = mockEvent.mock.invocationCallOrder[0];
    const lastTagOrder = Math.max(...mockSetTag.mock.invocationCallOrder);
    expect(lastTagOrder).toBeLessThan(eventOrder);
  });

  it('does not call clarity APIs when window is undefined (SSR)', async () => {
    const { trackEvent } = await import('./track');
    const originalWindow = globalThis.window;
    // @ts-expect-error -- intentionally simulating SSR
    delete globalThis.window;
    trackEvent('fully_booked_click', { source: 'header' });
    expect(mockEvent).not.toHaveBeenCalled();
    expect(mockSetTag).not.toHaveBeenCalled();
    globalThis.window = originalWindow;
  });

  it('omits setTag calls when no tags are provided', async () => {
    const { trackEvent } = await import('./track');
    trackEvent('fully_booked_hover');
    expect(mockSetTag).not.toHaveBeenCalled();
    expect(mockEvent).toHaveBeenCalledWith('fully_booked_hover');
  });
});
