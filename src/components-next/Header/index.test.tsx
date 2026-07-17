import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Header from './index';

const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf-8');

afterEach(cleanup);

describe('Header source', () => {
  it('does not link to cal.com', () => {
    expect(source).not.toMatch(/cal\.com/);
  });

  it('does not reference the retired FullyBookedCTA', () => {
    expect(source).not.toMatch(/FullyBookedCTA/);
  });

  it('does not link to the retired /ai-quality route', () => {
    expect(source).not.toMatch(/href=["']\/ai-quality["']/);
  });

  it('links to the blog and The Shift newsletter', () => {
    expect(source).toMatch(/href=["']\/blog["']/);
    expect(source).toMatch(/linkedin\.com\/newsletters\/the-shift/);
  });

  it('tracks newsletter clicks from the header', () => {
    expect(source).toContain('newsletter_subscribe_click');
    expect(source).toContain("placement: 'header'");
  });
});

describe('Header mobile menu focus', () => {
  it('keeps Tab focus inside the open menu', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(menuButton);

    const blogLink = screen.getByRole('link', { name: 'Blog' });
    const newsletterLink = screen.getByRole('link', {
      name: /The Shift/,
    });
    expect(blogLink).toHaveFocus();

    newsletterLink.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(menuButton).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(newsletterLink).toHaveFocus();
  });

  it('returns focus to the menu button when Escape closes it', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(menuButton);
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
  });
});
