'use client';

import { useEffect, useState } from 'react';
import styles from './Countdown.module.scss';

interface CountdownProps {
  manifoldSlug: string;
}

interface ManifoldAnswer {
  text: string;
  probability: number;
  midpoint: number;
}

interface MarketData {
  targetDate: Date;
  probability: number;
  answerText: string;
  marketUrl: string;
  question: string;
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

async function fetchMarketData(slug: string): Promise<MarketData | null> {
  try {
    const res = await fetch(`https://api.manifold.markets/v0/slug/${slug}`);
    if (!res.ok) return null;

    const data = await res.json();
    const answers: ManifoldAnswer[] = data.answers || [];
    if (answers.length === 0) return null;

    // Sort answers chronologically by midpoint
    const sorted = [...answers].sort((a, b) => a.midpoint - b.midpoint);

    // Find the 50% cumulative probability threshold
    let cumulative = 0;
    let thresholdAnswer = sorted[sorted.length - 1]; // fallback to last
    for (const answer of sorted) {
      cumulative += answer.probability;
      if (cumulative >= 0.5) {
        thresholdAnswer = answer;
        break;
      }
    }

    // Calculate cumulative probability up to and including the threshold month
    let cumulativeToThreshold = 0;
    for (const answer of sorted) {
      cumulativeToThreshold += answer.probability;
      if (answer.midpoint >= thresholdAnswer.midpoint) break;
    }

    return {
      targetDate: new Date(thresholdAnswer.midpoint),
      probability: Math.round(cumulativeToThreshold * 100),
      answerText: thresholdAnswer.text,
      marketUrl: data.url || `https://manifold.markets/${slug}`,
      question: data.question || '',
    };
  } catch {
    return null;
  }
}

export default function Countdown({ manifoldSlug }: CountdownProps) {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [time, setTime] = useState<ReturnType<typeof getTimeRemaining>>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchMarketData(manifoldSlug).then((data) => {
      if (data) {
        setMarket(data);
        const remaining = getTimeRemaining(data.targetDate);
        setTime(remaining);
        setExpired(!remaining);
      }
      setLoaded(true);
    });
  }, [manifoldSlug]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!market || reducedMotion || expired) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(market.targetDate);
      if (!remaining) {
        setExpired(true);
        setTime(null);
        clearInterval(interval);
      } else {
        setTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [market, reducedMotion, expired]);

  if (!loaded) return null;
  if (!market) return null;

  const approxDays = time ? time.days : 0;

  if (expired) {
    return (
      <div className={styles.container}>
        <div aria-live="polite" className={styles.expiry}>
          The window is open.
        </div>
        <p className={styles.attribution}>
          <a href={market.marketUrl} target="_blank" rel="noopener noreferrer">
            Manifold Markets
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>{' '}
          predicted a {market.probability}% chance by {market.answerText}.
        </p>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className={styles.container}>
        <p className={styles.static}>
          Approximately {approxDays} days until {market.answerText}.
        </p>
        <p className={styles.attribution}>
          <a href={market.marketUrl} target="_blank" rel="noopener noreferrer">
            Manifold Markets
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>{' '}
          gives a {market.probability}% chance by then.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.srOnly}>
        Manifold Markets estimates a {market.probability}% chance by{' '}
        {market.answerText}. Approximately {approxDays} days from now.
      </p>

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
        <a href={market.marketUrl} target="_blank" rel="noopener noreferrer">
          Manifold Markets
          <span className={styles.srOnly}> (opens in new tab)</span>
        </a>{' '}
        gives a {market.probability}% chance by {market.answerText}.
      </p>
    </div>
  );
}
