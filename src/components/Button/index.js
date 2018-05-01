import React from 'react'
import Link from 'gatsby-link'
import './index.css'

export default props => (
  <a
    href={props.href ? props.href : '#contact'}
    className={"button special " + (props.className ? props.className : '')}
    style={props.style}
    onClick={props.onClick}
  >
    {props.children}
  </a>
)
