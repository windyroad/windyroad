import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NewsletterButton from './index';

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

afterEach(cleanup);

describe('NewsletterButton', () => {
  it('tracks a newsletter click with its placement', () => {
    render(
      <NewsletterButton placement="hero">Subscribe on LinkedIn</NewsletterButton>,
    );

    fireEvent.click(screen.getByRole('link', { name: /Subscribe on LinkedIn/ }));

    expect(mockSetTag).toHaveBeenCalledWith('placement', 'hero');
    expect(mockEvent).toHaveBeenCalledWith('newsletter_subscribe_click');
  });

  it('opens the newsletter in a new tab', () => {
    render(
      <NewsletterButton placement="article-end">
        Subscribe on LinkedIn
      </NewsletterButton>,
    );

    const link = screen.getByRole('link', { name: /Subscribe on LinkedIn/ });
    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/newsletters/the-shift-7450748696826134528/',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not cancel modified link clicks', () => {
    render(
      <NewsletterButton placement="footer">
        Subscribe to The Shift on LinkedIn
      </NewsletterButton>,
    );

    const link = screen.getByRole('link', { name: /Subscribe to The Shift/ });
    expect(fireEvent.click(link, { metaKey: true })).toBe(true);
  });
});
