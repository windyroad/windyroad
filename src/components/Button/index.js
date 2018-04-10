import React from 'react'
import Link from 'gatsby-link'
import './index.css'

export default props => (
  <a
    href="#contact"
    className="button special"
    style={props.style}
    onClick={props.onClick}
  >
    {props.children}
  </a>
)
