import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleContent from './ArticleContent';

describe('ArticleContent', () => {
  it('pans an overflowing figure with the arrow keys', () => {
    const { container } = render(
      <ArticleContent html={'<figure tabindex="0"><img alt="Chart" /></figure>'} />,
    );
    const figure = container.querySelector('figure');

    expect(figure).not.toBeNull();
    Object.defineProperties(figure, {
      clientWidth: { configurable: true, value: 320 },
      scrollWidth: { configurable: true, value: 800 },
    });

    fireEvent.keyDown(figure!, { key: 'ArrowRight' });
    expect(figure!.scrollLeft).toBeGreaterThan(0);

    fireEvent.keyDown(figure!, { key: 'ArrowLeft' });
    expect(figure!.scrollLeft).toBe(0);
  });
});
