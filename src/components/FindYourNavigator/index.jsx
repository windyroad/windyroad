import { faRandom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Link } from 'react-scroll';
import './index.css';

const FindYourNavigator = function({ duration, ...otherProps }) {
  return (
    <Link
      className="special button cta"
      to="contact"
      spy
      smooth
      hashSpy
      duration={duration}
      data-duration={duration}
      {...otherProps}
    >
      Find your{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        navigator<FontAwesomeIcon
          icon={faRandom}
          size="1x"
          style={{
            verticalAlign: 'middle',
            marginLeft: '0.5em',
          }}
        />
      </span>
    </Link>
  );
};

FindYourNavigator.propTypes = {
  duration: PropTypes.number,
  topic: PropTypes.string,
};

FindYourNavigator.defaultProps = {
  duration: 1000,
  topic: '',
};

export default FindYourNavigator;
