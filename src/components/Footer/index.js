import {
  faFacebook,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { faAmbulance } from '@fortawesome/free-solid-svg-icons';
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Col, Row } from 'react-flexbox-grid';

const Footer = function() {
  return (
    <footer id="footer">
      <ul className="icons">
        {/* <li><a href="#" className="icon alt fa-twitter"><span className="label">Twitter</span></a></li> */}
        <li>
          <a
            href="https://www.facebook.com/windyroadtechnology/"
            className="icon alt brand"
          >
            {String.fromCharCode(parseInt('0x' + faFacebook.icon[3]))}
            <span className="label">Facebook</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/company/windy-road"
            className="icon alt brand"
          >
            {String.fromCharCode(parseInt('0x' + faLinkedin.icon[3]))}
            <span className="label">LinkedIn</span>
          </a>
        </li>
        {/* <li><a href="#" className="icon alt fa-instagram"><span className="label">Instagram</span></a></li> */}
        <li>
          <a href="https://github.com/windyroad" className="icon alt brand">
            {String.fromCharCode(parseInt('0x' + faGithub.icon[3]))}
            <span className="label">GitHub</span>
          </a>
        </li>
        <li>
          <a
            href="https://support.windyroad.com.au"
            className="icon alt"
            style={{ fontWeight: 900 }}
          >
            {String.fromCharCode(parseInt('0x' + faAmbulance.icon[3]))}
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
              <em>&apos;Windy Road&apos;</em>, the Windy Road logo and{' '}
              <em>&apos;Find you navigator&apos;</em> are trademarks of Windy
              Road Technology
            </Col>
          </Row>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
