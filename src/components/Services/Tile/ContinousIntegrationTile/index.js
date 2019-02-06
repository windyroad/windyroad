import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { faShippingFast } from '@fortawesome/free-solid-svg-icons';
import Tile from '..';
import './index.css';
import background from './AdobeStock_151768108-1024x683.jpg';

const ContinousIntegrationTile = function() {
  return (
    <Tile
      title="Continuous Integration &amp; Continuous Delivery"
      className="continuous-integration"
      excerpt="Going live doesn't need to be expensive and risky."
      background={background}
      icon={faShippingFast}
      topic="CI/CD"
    />
  );
};

export default ContinousIntegrationTile;
