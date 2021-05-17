import Link from 'gatsby-link';
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import logo from '../../img/logo-white.svg';
import './index.css';

const Header = () => (
  <header id="header">
    <h1 id="logo">
      <Link to="/">
        <img
          src={logo}
          alt="Windy Road Logo"
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
          <Link to="blog">Blog</Link>
        </li>
        {/* <li>
          <a href="https://windyroad.com.au/articles/">Older Blog Posts</a>
        </li> */}
      </ul>
    </nav>
  </header>
);

export default Header;
