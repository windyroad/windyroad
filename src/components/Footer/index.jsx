import {
  faFacebook,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { faAmbulance, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Col, Row } from 'react-flexbox-grid';
import { Link } from 'react-scroll';

const Footer = function() {
  return (
    <footer id="footer">
      <ul className="icons">
        {/* <li><a href="#" className="icon alt fa-twitter"><span className="label">Twitter</span></a></li> */}
        <li>
          <a
            href="https://www.facebook.com/windyroadtechnology/"
            className="icon alt"
          >
            <FontAwesomeIcon icon={faFacebook} size="2x" />
            <span className="label">Facebook</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/company/windy-road"
            className="icon alt"
          >
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
            <span className="label">LinkedIn</span>
          </a>
        </li>
        {/* <li><a href="#" className="icon alt fa-instagram"><span className="label">Instagram</span></a></li> */}
        <li>
          <a href="https://github.com/windyroad" className="icon alt">
            <FontAwesomeIcon icon={faGithub} size="2x" />
            <span className="label">GitHub</span>
          </a>
        </li>
        <li>
          <Link
            to="contact"
            spy
            smooth
            hashSpy
            duration={1000}
            className="icon alt"
          >
            <FontAwesomeIcon icon={faEnvelope} size="2x" />
            <span className="label">Email</span>
          </Link>
        </li>
        <li>
          <a href="https://support.windyroad.com.au" className="icon alt">
            <FontAwesomeIcon icon={faAmbulance} size="2x" />

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
  );
};

export default Footer;
