'use client';

import FindYourNavigator from '../FindYourNavigator';
import Spotlight from '../Spotlight';
import '../../components/About/index.css';

const whiteboardImages: Record<number, string> = {
  45: '/img/about/whiteboard-45.jpeg',
  90: '/img/about/whiteboard-90.jpeg',
  180: '/img/about/whiteboard-180.jpeg',
  360: '/img/about/whiteboard-360.jpeg',
  720: '/img/about/whiteboard-720.jpeg',
  1440: '/img/about/whiteboard-1440.jpeg',
  2880: '/img/about/whiteboard-2880.jpeg',
};

interface AboutProps {
  id: string;
  next: string;
  nextActive?: () => void;
  nextInactive?: () => void;
}

export default function About({ id, next, nextActive, nextInactive }: AboutProps) {
  return (
    <Spotlight
      id={id}
      images={whiteboardImages}
      className="style1 bottom"
      next={next}
      nextActive={nextActive}
      nextInactive={nextInactive}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1em' }}>
          <div style={{ flex: '0 0 auto', maxWidth: '25%' }}>
            <header>
              <h2>A Little About Us</h2>
            </header>
          </div>
          <div style={{ flex: '1 1 0', fontSize: 'larger', minWidth: '200px' }}>
            <p>
              Windy Road Technology is a passionate, Sydney based, consulting
              company that can help you navigate the complexities of software and
              product development.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1em' }}>
          <div style={{ flex: '0 1 58%', minWidth: '200px' }}>
            <p className="verbose">
              We are experts in high quality, efficient, and high velocity
              software and product delivery. We have many years of experience in{' '}
              <i>Continuous Integration</i>, <i>Continuous Delivery</i>,{' '}
              <i>Test Automation</i>, <i>Agile</i>, <i>Lean</i> and{' '}
              <i>Lean Start-up</i> and we have repeatedly, successfully pioneered
              their use within the organisations we work with.
            </p>
          </div>
          <div style={{ flex: '0 1 33%', minWidth: '200px' }}>
            <p>
              Our experience can help you avoid the many potholes along the way
              to <i>FAST</i> software and product delivery.
            </p>
            <div style={{ textAlign: 'center' }}>
              <FindYourNavigator />
            </div>
          </div>
        </div>
      </div>
    </Spotlight>
  );
}
