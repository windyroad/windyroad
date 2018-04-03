import React from 'react'
import Link from 'gatsby-link'


class Footer extends React.Component {
      render() {
        
        return 	<footer id="footer">
        <ul className="icons">
            <li><a href="#" className="icon alt fa-twitter"><span className="label">Twitter</span></a></li>
            <li><a href="#" className="icon alt fa-facebook"><span className="label">Facebook</span></a></li>
            <li><a href="#" className="icon alt fa-linkedin"><span className="label">LinkedIn</span></a></li>
            <li><a href="#" className="icon alt fa-instagram"><span className="label">Instagram</span></a></li>
            <li><a href="#" className="icon alt fa-github"><span className="label">GitHub</span></a></li>
            <li><a href="#" className="icon alt fa-envelope"><span className="label">Email</span></a></li>
        </ul>
        <ul className="copyright">
            <li>&copy; Windy Road. All rights reserved.</li>
        </ul>
    </footer>
    }
}


export default Footer
