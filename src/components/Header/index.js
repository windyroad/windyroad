import Link from 'gatsby-link'
import React from 'react'
import logo from '../../img/logo-white.svg'
import './index.css'

const Header = props => (
  <header id="header">
    <h1 id="logo">
      <Link to="/">
        <img
          src={logo}
          style={{
            verticalAlign: 'middle',
            position: 'relative',
            bottom: '0.2em',
          }}
        />
      </Link>
    </h1>
    <nav id="nav">
      <ul>
        <li>
          <a href="https://windyroad.com.au/articles/">Archive</a>
        </li>
      </ul>
    </nav>
  </header>
)

export default Header
