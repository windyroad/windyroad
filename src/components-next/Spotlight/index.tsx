'use client';

import { useEffect, useState, useCallback } from 'react';
import GotoNext from '../GotoNext';
import './index.css';

interface SpotlightProps {
  id: string;
  images: Record<number, string>;
  className: string;
  next: string;
  nextActive?: () => void;
  nextInactive?: () => void;
  children: React.ReactNode;
}

export default function Spotlight({
  id,
  images,
  className,
  next,
  nextActive,
  nextInactive,
  children,
}: SpotlightProps) {
  const sortedKeys = Object.keys(images)
    .map(Number)
    .sort((a, b) => a - b);
  const [currentImage, setCurrentImage] = useState(images[sortedKeys[0]]);
  const [active, setActive] = useState('active');

  const pickImage = useCallback(() => {
    const pixelRatio = window.devicePixelRatio || 1;
    const targetWidth = window.innerWidth * pixelRatio;

    let bestKey = sortedKeys[0];
    for (const key of sortedKeys) {
      if (key >= targetWidth) {
        bestKey = key;
        break;
      }
      bestKey = key;
    }

    const newSrc = images[bestKey];
    if (newSrc !== currentImage) {
      const img = new Image();
      img.onload = () => setCurrentImage(newSrc);
      img.src = newSrc;
    }
  }, [images, sortedKeys, currentImage]);

  useEffect(() => {
    pickImage();
    window.addEventListener('resize', pickImage);
    return () => window.removeEventListener('resize', pickImage);
  }, [pickImage]);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive('active');
        } else {
          setActive('inactive');
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section
      id={id}
      className={`${className} backdropped spotlightx ${active}`}
      style={{ backgroundImage: `url(${currentImage})` }}
    >
      <div className="content">{children}</div>
      <GotoNext
        to={next}
        onSetActive={nextActive}
        onSetInactive={nextInactive}
      />
    </section>
  );
}
