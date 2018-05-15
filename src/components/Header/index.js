import React from 'react'
import Link from 'gatsby-link'
import Img from "gatsby-image";

import "./index.css"
import logo from "./logo-white.svg"

const Header = (props) => (
     <header id="header">
        <h1 id="logo">
            <Link to="/" >
                <img src={logo} style={{ verticalAlign: 'middle', position: 'relative', bottom: '0.2em' }}/>
            </Link>
        </h1>
        <nav id="nav">
            <ul>
                <li><Link to="/articles/">Archive</Link></li>
            </ul>
        </nav>
    </header>
);


export default Header;