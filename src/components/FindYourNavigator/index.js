import React from 'react'
import './index.css'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from 'react-scroll'

export default props => (
  <Link
    className="special button"
    to="contact"
    spy={true}
    smooth={true}
    hashSpy={true}
    duration={1000}
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
