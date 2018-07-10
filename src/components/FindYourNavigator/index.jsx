import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import FontAwesome from 'react-fontawesome'
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
      Find your navigator
      <FontAwesome
        name="random"
        style={{
          verticalAlign: 'middle',
          paddingLeft: '0.5em',
        }}
      />
    </Link>
  )
}

FindYourNavigator.propTypes = {
  duration: PropTypes.number,
}

FindYourNavigator.defaultProps = {
  duration: 1000,
}

export default FindYourNavigator
