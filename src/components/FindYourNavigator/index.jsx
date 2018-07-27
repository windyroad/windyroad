import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRandom } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-scroll'
import './index.css'

const FindYourNavigator = function(props) {
  return (
    <Link
      className="special button cta"
      to="contact"
      spy
      smooth
      hashSpy
      duration={props.duration}
      data-duration={props.duration}
      {...props}
    >
      Find your {props.topic}{' '}
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
  )
}

FindYourNavigator.propTypes = {
  duration: PropTypes.number,
  topic: PropTypes.string,
}

FindYourNavigator.defaultProps = {
  duration: 1000,
  topic: '',
}

export default FindYourNavigator
