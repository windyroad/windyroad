import React from 'react'
import Link from 'gatsby-link'
import Img from "gatsby-image";

import "./index.css"
import logo from "./logo-white.svg"

const Header = (props) => (
     <header id="header">
        <h1 id="logo">
            <Link to="/" >
                <img src={logo} style={{ verticalAlign: 'middle' }}/>
            </Link>
        </h1>
        <nav id="nav">
            <ul>

            </ul>
        </nav>
    </header>
);


export default Header;