'use client';

import { faRandom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './index.css';

interface FindYourNavigatorProps {
  duration?: number;
}

export default function FindYourNavigator({
  duration = 1000,
}: FindYourNavigatorProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      className="special button cta"
      href="#contact"
      onClick={handleClick}
      data-duration={duration}
    >
      Find your{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        navigator
        <FontAwesomeIcon
          icon={faRandom}
          size="1x"
          style={{ marginLeft: '0.5em' }}
        />
      </span>
    </a>
  );
}
