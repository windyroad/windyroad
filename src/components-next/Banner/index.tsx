'use client';

import { useEffect, useState, useCallback } from 'react';
import FindYourNavigator from '../FindYourNavigator';
import GotoNext from '../GotoNext';
import '../../components/Banner/index.css';

const bannerImages: Record<number, string> = {
  20: '/img/banner/banner-20.jpeg',
  45: '/img/banner/banner-45.jpeg',
  90: '/img/banner/banner-90.jpeg',
  180: '/img/banner/banner-180.jpeg',
  360: '/img/banner/banner-360.jpeg',
  720: '/img/banner/banner-720.jpeg',
  1440: '/img/banner/banner-1440.jpeg',
  2880: '/img/banner/banner-2880.jpeg',
};

const sortedKeys = Object.keys(bannerImages)
  .map(Number)
  .sort((a, b) => a - b);

interface BannerProps {
  next: string;
  nextActive?: () => void;
  nextInactive?: () => void;
}

export default function Banner({ next, nextActive, nextInactive }: BannerProps) {
  const [currentImage, setCurrentImage] = useState(bannerImages[20]);

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

    const newSrc = bannerImages[bestKey];
    if (newSrc !== currentImage) {
      const img = new Image();
      img.onload = () => setCurrentImage(newSrc);
      img.src = newSrc;
    }
  }, [currentImage]);

  useEffect(() => {
    pickImage();
    window.addEventListener('resize', pickImage);
    return () => window.removeEventListener('resize', pickImage);
  }, [pickImage]);

  return (
    <section
      id="banner"
      style={{ backgroundImage: `url(${currentImage})` }}
      className="backdropped"
    >
      <div className="content">
        <header>
          <h2>
            <img src="/img/logo-white.svg" className="logo" alt="Windy Road" />
          </h2>
          <p>
            <strong>Your Software Delivery &amp; DevOps Experts</strong>
          </p>
          <p>
            We help you on the road to high quality, efficient, and high velocity
            software delivery.
          </p>
          <FindYourNavigator />
        </header>
      </div>

      <GotoNext
        to={next}
        onSetActive={nextActive}
        onSetInactive={nextInactive}
      />
    </section>
  );
}
