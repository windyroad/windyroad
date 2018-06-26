import React from 'react'
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from 'react-scroll'
import { Grid, Row, Col } from 'react-flexbox-grid'

class Footer extends React.Component {
  render() {
    return (
      <footer id="footer">
        <ul className="icons">
          {/* <li><a href="#" className="icon alt fa-twitter"><span className="label">Twitter</span></a></li> */}
          <li>
            <a
              href="https://www.facebook.com/windyroadtechnology/"
              className="icon alt fa-facebook"
            >
              <span className="label">Facebook</span>
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/company/windy-road"
              className="icon alt fa-linkedin"
            >
              <span className="label">LinkedIn</span>
            </a>
          </li>
          {/* <li><a href="#" className="icon alt fa-instagram"><span className="label">Instagram</span></a></li> */}
          <li>
            <a
              href="https://github.com/windyroad"
              className="icon alt fa-github"
            >
              <span className="label">GitHub</span>
            </a>
          </li>
          <li>
            <Link
              to="contact"
              spy={true}
              smooth={true}
              hashSpy={true}
              duration={1000}
              className="icon alt fa-envelope"
            >
              <span className="label">Email</span>
            </Link>
          </li>
          <li>
            <a
              href="https://support.windyroad.com.au"
              className="icon alt fa-ambulance"
            >
              <span className="label">Support</span>
            </a>
          </li>
        </ul>
        <ul className="copyright" style={{ lineHeight: '1.5em' }}>
          <li>
            <Row>
              <Col xs={12} style={{ marginBottom: '0.5em' }}>
                &copy; {new Date().getFullYear()} Windy Road Technology. All
                rights reserved.
              </Col>
              <Col xs={12}>
                <em>'Windy Road'</em>, the Windy Road logo and{' '}
                <em>'Find you navigator'</em> are trademarks of Windy Road
                Technology
              </Col>
            </Row>
          </li>
        </ul>
      </footer>
    )
  }
}

export default Footer
