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
  sortedAnswers: ManifoldAnswer[];
  defaultIndex: number;
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

function getCumulativeProbability(sortedAnswers: ManifoldAnswer[], index: number): number {
  let cumulative = 0;
  for (let i = 0; i <= index; i++) {
    cumulative += sortedAnswers[i].probability;
  }
  return Math.round(cumulative * 100);
}

function getAllCumulativeProbabilities(sortedAnswers: ManifoldAnswer[]): number[] {
  const result: number[] = [];
  let cumulative = 0;
  for (const answer of sortedAnswers) {
    cumulative += answer.probability;
    result.push(Math.round(cumulative * 100));
  }
  return result;
}

function snapToNearest(value: number, stops: number[]): number {
  let closest = 0;
  let minDist = Math.abs(value - stops[0]);
  for (let i = 1; i < stops.length; i++) {
    const dist = Math.abs(value - stops[i]);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  return closest;
}

function getDefaultIndex(sortedAnswers: ManifoldAnswer[]): number {
  let cumulative = 0;
  for (let i = 0; i < sortedAnswers.length; i++) {
    cumulative += sortedAnswers[i].probability;
    if (cumulative >= 0.5) return i;
  }
  return sortedAnswers.length - 1;
}

async function fetchMarketData(slug: string): Promise<MarketData | null> {
  try {
    const res = await fetch(`https://api.manifold.markets/v0/slug/${slug}`);
    if (!res.ok) return null;

    const data = await res.json();
    const answers: ManifoldAnswer[] = data.answers || [];
    if (answers.length === 0) return null;

    const sortedAnswers = [...answers].sort((a, b) => a.midpoint - b.midpoint);

    return {
      sortedAnswers,
      defaultIndex: getDefaultIndex(sortedAnswers),
      marketUrl: data.url || `https://manifold.markets/${slug}`,
      question: data.question || '',
    };
  } catch {
    return null;
  }
}

export default function Countdown({ manifoldSlug }: CountdownProps) {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [bucketIndex, setBucketIndex] = useState<number>(0);
  const [time, setTime] = useState<ReturnType<typeof getTimeRemaining>>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchMarketData(manifoldSlug).then((data) => {
      if (data) {
        setMarket(data);
        setBucketIndex(data.defaultIndex);
        const targetDate = new Date(data.sortedAnswers[data.defaultIndex].midpoint);
        const remaining = getTimeRemaining(targetDate);
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

  const currentAnswer = market?.sortedAnswers[bucketIndex];
  const midpoint = currentAnswer?.midpoint ?? null;
  const targetDate = midpoint ? new Date(midpoint) : null;
  const probability = market ? getCumulativeProbability(market.sortedAnswers, bucketIndex) : 0;

  useEffect(() => {
    if (!midpoint || reducedMotion || expired) return;

    const target = new Date(midpoint);
    const remaining = getTimeRemaining(target);
    if (!remaining) {
      setExpired(true);
      setTime(null);
      return;
    }

    setTime(remaining);
    const interval = setInterval(() => {
      const r = getTimeRemaining(target);
      if (!r) {
        setExpired(true);
        setTime(null);
        clearInterval(interval);
      } else {
        setTime(r);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [midpoint, reducedMotion, expired]);

  if (!loaded) return null;
  if (!market || !currentAnswer) return null;

  const approxDays = time ? time.days : 0;
  const valueText = `${currentAnswer.text}, ${probability}% cumulative probability`;

  const cumulativeStops = market ? getAllCumulativeProbabilities(market.sortedAnswers) : [];

  const slider = market.sortedAnswers.length > 1 && (
    <div className={styles.slider}>
      <label htmlFor="probability-slider" className={styles.sliderLabel}>
        Probability threshold
      </label>
      <div className={styles.sliderTrack}>
        <input
          type="range"
          id="probability-slider"
          min={0}
          max={100}
          step={1}
          value={probability}
          aria-valuetext={valueText}
          onChange={(e) => {
            const pct = Number(e.target.value);
            const newIndex = snapToNearest(pct, cumulativeStops);
            setBucketIndex(newIndex);
            const newTarget = new Date(market.sortedAnswers[newIndex].midpoint);
            const remaining = getTimeRemaining(newTarget);
            setExpired(!remaining);
            setTime(remaining);
          }}
          className={styles.sliderInput}
        />
        <div className={styles.sliderDots} aria-hidden="true">
          {cumulativeStops.map((pct, i) => (
            <span
              key={i}
              className={styles.sliderDot}
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>
      </div>
      <output htmlFor="probability-slider" className={styles.sliderValue}>
        {currentAnswer.text} ({probability}%)
      </output>
    </div>
  );

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
          predicted a {probability}% chance of arrival by {currentAnswer.text}.
        </p>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className={styles.container}>
        <p className={styles.static}>
          Approximately {approxDays} days until {currentAnswer.text}.
        </p>
        {slider}
        <p className={styles.attribution}>
          <a href={market.marketUrl} target="_blank" rel="noopener noreferrer">
            Manifold Markets
            <span className={styles.srOnly}> (opens in new tab)</span>
          </a>{' '}
          gives a {probability}% chance of arrival by then.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.srOnly}>
        Manifold Markets estimates a {probability}% chance of arrival by{' '}
        {currentAnswer.text}. Approximately {approxDays} days from now.
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

      {slider}

      <p className={styles.attribution}>
        <a href={market.marketUrl} target="_blank" rel="noopener noreferrer">
          Manifold Markets
          <span className={styles.srOnly}> (opens in new tab)</span>
        </a>{' '}
        gives a {probability}% chance of arrival by {currentAnswer.text}.
      </p>
    </div>
  );
}
