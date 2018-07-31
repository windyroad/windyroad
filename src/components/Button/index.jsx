import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import './index.css'

const Button = props => (
  <a
    href={props.href}
    className={'button special ' + props.className}
    style={props.style}
    onClick={props.onClick}
  >
    {props.children}
  </a>
)

Button.propTypes = {
  href: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

Button.defaultProps = {
  href: '#contact',
  className: '',
}

export default Button
