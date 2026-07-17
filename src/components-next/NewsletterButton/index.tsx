'use client';

import type { ReactNode } from 'react';
import Button from '@/src/components-next/Button';
import { trackEvent } from '@/src/components-next/Clarity/track';

const NEWSLETTER_URL =
  'https://www.linkedin.com/newsletters/the-shift-7450748696826134528/';

interface NewsletterButtonProps {
  placement: 'hero' | 'footer' | 'article-end';
  size?: 'default' | 'large';
  children: ReactNode;
}

export default function NewsletterButton({
  placement,
  size = 'large',
  children,
}: NewsletterButtonProps) {
  return (
    <Button
      href={NEWSLETTER_URL}
      size={size}
      external
      onClick={() =>
        trackEvent('newsletter_subscribe_click', { placement })
      }
    >
      {children}
    </Button>
  );
}
