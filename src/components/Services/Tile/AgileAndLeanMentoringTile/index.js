import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import Tile from '..';
import background from './AdobeStock_90682313-1024x683.jpg';
import './index.css';

const AgileAndLeanMentoringTile = function() {
  return (
    <Tile
      title="Agile &amp; Lean Mentoring"
      className="agile-and-lean-mentoring"
      excerpt="Need help or a refresher on your Agile or Lean journey?"
      background={background}
      icon={faChartLine}
      topic="agile &amp; lean"
    />
  );
};

export default AgileAndLeanMentoringTile;
