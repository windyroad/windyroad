import {
  faFacebook,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { faAmbulance } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer id="footer">
      <ul className="icons">
        <li>
          <a
            href="https://www.facebook.com/windyroadtechnology/"
            className="icon alt brand"
          >
            {String.fromCharCode(parseInt('0x' + faFacebook.icon[3], 16))}
            <span className="label">Facebook</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/company/windy-road"
            className="icon alt brand"
          >
            {String.fromCharCode(parseInt('0x' + faLinkedin.icon[3], 16))}
            <span className="label">LinkedIn</span>
          </a>
        </li>
        <li>
          <a href="https://github.com/windyroad" className="icon alt brand">
            {String.fromCharCode(parseInt('0x' + faGithub.icon[3], 16))}
            <span className="label">GitHub</span>
          </a>
        </li>
        <li>
          <a
            href="https://support.windyroad.com.au"
            className="icon alt"
            style={{ fontWeight: 900 }}
          >
            {String.fromCharCode(parseInt('0x' + faAmbulance.icon[3], 16))}
            <span className="label">Support</span>
          </a>
        </li>
      </ul>
      <ul className="copyright" style={{ lineHeight: '1.5em' }}>
        <li>
          <div>
            <div style={{ marginBottom: '0.5em' }}>
              &copy; {new Date().getFullYear()} Windy Road Technology. All
              rights reserved.
            </div>
            <div>
              <em>&apos;Windy Road&apos;</em>, the Windy Road logo and{' '}
              <em>&apos;Find you navigator&apos;</em> are trademarks of Windy
              Road Technology
            </div>
          </div>
        </li>
      </ul>
    </footer>
  );
}
