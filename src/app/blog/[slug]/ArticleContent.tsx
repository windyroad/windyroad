'use client';

import type { KeyboardEvent } from 'react';

export default function ArticleContent({ html }: { html: string }) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const figure = event.target;
    if (!(figure instanceof HTMLElement) || figure.tagName !== 'FIGURE') return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const maxScroll = figure.scrollWidth - figure.clientWidth;
    if (maxScroll <= 0) return;

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const step = Math.round(figure.clientWidth * 0.8);
    figure.scrollLeft = Math.min(
      maxScroll,
      Math.max(0, figure.scrollLeft + direction * step),
    );
    event.preventDefault();
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
