'use client';

import { faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import './index.css';

interface GotoNextProps {
  to: string;
  onSetActive?: () => void;
  onSetInactive?: () => void;
}

export default function GotoNext({ to }: GotoNextProps) {
  const [click, setClick] = useState(false);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const el = document.getElementById(to);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      className={`goto-next${click ? ' click' : ''}`}
      href={`#${to}`}
      onClick={handleClick}
      onTouchStart={() => setClick(true)}
      onTouchEnd={() => setClick(false)}
    >
      <FontAwesomeIcon icon={faArrowAltCircleDown} />
    </a>
  );
}
