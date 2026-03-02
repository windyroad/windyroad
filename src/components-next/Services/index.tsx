'use client';

import { useEffect, useState } from 'react';
import { faChartLine, faShippingFast, faVial } from '@fortawesome/free-solid-svg-icons';
import { faCompass } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import GotoNext from '../GotoNext';
import './services.css';
import './tile.css';

interface TileProps {
  title: string;
  className: string;
  excerpt: string;
  background: string;
  icon: IconDefinition;
}

function Tile({ title, className, excerpt, background, icon }: TileProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <article className={`${className} service-item`}>
      <a
        href="#contact"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <img src={background} alt="" />
        <div className="overlay">
          <div className="outside">
            <div className="inside">
              <div className="overlay-child">
                <FontAwesomeIcon icon={icon} size="2x" />
                <h3>{title}</h3>
              </div>
            </div>
            <div className="excerpt">{excerpt}</div>
          </div>
        </div>
      </a>
    </article>
  );
}

const tiles = [
  {
    title: 'Agile & Lean Mentoring',
    className: 'agile-and-lean-mentoring',
    excerpt: 'Need help or a refresher on your Agile or Lean journey?',
    background: '/img/services/agile-mentoring.jpg',
    icon: faChartLine,
  },
  {
    title: 'Continuous Integration & Continuous Delivery',
    className: 'continuous-integration',
    excerpt: "Going live doesn't need to be expensive and risky.",
    background: '/img/services/continuous-integration.jpg',
    icon: faShippingFast,
  },
  {
    title: 'Product Resharpening',
    className: 'product-resharpening',
    excerpt: 'Get your great idea moving again.',
    background: '/img/services/product-resharpening.jpg',
    icon: faCompass,
  },
  {
    title: 'BDD & Test Automation Service',
    className: 'test-automation',
    excerpt: 'Get so much more from your test automation efforts.',
    background: '/img/services/test-automation.jpg',
    icon: faVial,
  },
];

interface ServicesProps {
  id: string;
  next: string;
  nextActive?: () => void;
  nextInactive?: () => void;
}

export default function Services({ id, next, nextActive, nextInactive }: ServicesProps) {
  const [active, setActive] = useState('active');

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting ? 'active' : 'inactive');
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section id={id} className={active}>
      <div className="content">
        <header>
          <h2>Services</h2>
        </header>
        <div className="service-items">
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {tiles.map((tile) => (
              <div
                key={tile.className}
                style={{ flex: '1 1 25%', minWidth: '250px', padding: 0 }}
              >
                <Tile {...tile} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <GotoNext
        to={next}
        onSetActive={nextActive}
        onSetInactive={nextInactive}
      />
    </section>
  );
}
