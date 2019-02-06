import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { faCompass } from '@fortawesome/free-regular-svg-icons';
import Tile from '..';
import './index.css';
import background from './AdobeStock_56134592-1024x683.jpg';

const ProductResharpeningTile = function() {
  return (
    <Tile
      title="Product Resharpening"
      className="product-resharpening"
      excerpt="Get your great idea moving again."
      background={background}
      icon={faCompass}
      topic="product development"
    />
  );
};

export default ProductResharpeningTile;
