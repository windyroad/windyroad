'use client';

import { useRef } from 'react';
import { trackEvent } from '@/src/components-next/Clarity/track';
import { useFullyBookedStatus } from '@/src/components-next/FullyBookedStatus';
import styles from './FullyBookedCTA.module.scss';

export type FullyBookedSource =
  | 'header'
  | 'homepage_hero'
  | 'homepage_pricing_t1'
  | 'homepage_pricing_t2'
  | 'homepage_pricing_t3'
  | 'homepage_final'
  | 'founders_hero'
  | 'founders_cta'
  | 'vibe_audit_hero'
  | 'vibe_audit_15min'
  | 'ai_quality_hero'
  | 'ai_quality_pricing_t1'
  | 'ai_quality_pricing_t2'
  | 'ai_quality_pricing_t3'
  | 'ai_quality_final';

interface FullyBookedCTAProps {
  source: FullyBookedSource;
  variant?: 'primary' | 'inverted';
  size?: 'default' | 'large';
}

const ARIA_LABEL = 'Fully booked. Not taking new engagements right now.';
const STATUS_MESSAGE =
  "We're fully booked right now. Subscribe to The Shift for a note when that changes.";

export default function FullyBookedCTA({
  source,
  variant = 'primary',
  size = 'default',
}: FullyBookedCTAProps) {
  const hoverFiredRef = useRef(false);
  const { setStatus } = useFullyBookedStatus();

  const className = [
    styles.button,
    styles[variant],
    size === 'large' ? styles.large : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    trackEvent('fully_booked_click', { source });
    setStatus(STATUS_MESSAGE);
  };

  const handleMouseEnter = () => {
    if (hoverFiredRef.current) return;
    hoverFiredRef.current = true;
    trackEvent('fully_booked_hover', { source });
  };

  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={ARIA_LABEL}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <span className={styles.struck} aria-hidden="true">
        Book a Call
      </span>
      <span className={styles.replacement} aria-hidden="true">
        Fully Booked
      </span>
    </button>
  );
}
