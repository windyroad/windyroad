'use client';

import { useEffect, useState } from 'react';
import styles from './Countdown.module.scss';

interface CountdownProps {
  targetDate: string;
  probability: number;
  sourceUrl: string;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Countdown({ targetDate, probability, sourceUrl }: CountdownProps) {
  const targetTimestamp = new Date(targetDate + 'T00:00:00').getTime();
  const target = new Date(targetTimestamp);
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expired, setExpired] = useState(() => targetTimestamp <= Date.now());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    if (mq.matches) return;

    if (expired) return;

    const t = new Date(targetTimestamp);
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(t);
      if (!remaining) {
        setExpired(true);
        setTime(null);
        clearInterval(interval);
      } else {
        setTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, expired]);

  const formattedDate = formatDate(targetDate);
  const approxDays = time ? time.days : 0;

  if (expired) {
    return (
      <div className={styles.container}>
        <div aria-live="polite" className={styles.expiry}>
          The window is open.
        </div>
        <p className={styles.attribution}>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Polymarket
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>{' '}
          predicted a {probability}% chance by {formattedDate}.
        </p>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className={styles.container}>
        <p className={styles.static}>
          Approximately {approxDays} days until {formattedDate}.
        </p>
        <p className={styles.attribution}>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Polymarket
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>{' '}
          gives a {probability}% chance Mythos goes public by then.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Screen reader text */}
      <p className={styles.srOnly}>
        Polymarket estimates a {probability}% chance Mythos goes public by{' '}
        {formattedDate}. Approximately {approxDays} days from now.
      </p>

      {/* Visual countdown - hidden from screen readers */}
      {time && (
        <div aria-hidden="true" className={styles.grid}>
          <div className={styles.unit}>
            <div className={styles.value}>{time.days}</div>
            <div className={styles.label}>Days</div>
          </div>
          <div className={styles.unit}>
            <div className={styles.value}>{time.hours}</div>
            <div className={styles.label}>Hours</div>
          </div>
          <div className={styles.unit}>
            <div className={styles.value}>{time.minutes}</div>
            <div className={styles.label}>Minutes</div>
          </div>
          <div className={styles.unit}>
            <div className={styles.value}>{time.seconds}</div>
            <div className={styles.label}>Seconds</div>
          </div>
        </div>
      )}

      <p className={styles.attribution}>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          Polymarket
          <span className={styles.srOnly}> (opens in new tab)</span>
        </a>{' '}
        gives a {probability}% chance Mythos goes public by {formattedDate}.
      </p>
    </div>
  );
}
