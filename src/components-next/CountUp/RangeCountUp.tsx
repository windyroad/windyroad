'use client';

import { useEffect, useRef, useState } from 'react';

interface RangeCountUpProps {
  start: number;
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function RangeCountUp({
  start,
  end,
  suffix = '',
  duration = 1200,
  className,
}: RangeCountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setCurrent(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    function animate() {
      const animStart = performance.now();

      function tick(now: number) {
        const elapsed = now - animStart;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(start + eased * (end - start)));
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    return () => observer.disconnect();
  }, [start, end, duration]);

  const final = `${start} \u2192 ${end}${suffix}`;

  return (
    <div ref={ref} className={className} style={{ position: 'relative', display: 'inline-grid' }}>
      <span style={{ visibility: 'hidden', gridArea: '1/1' }} aria-hidden="true">{final}</span>
      <span style={{ gridArea: '1/1', textAlign: 'center' }}>{start} &rarr; {current}{suffix}</span>
    </div>
  );
}
