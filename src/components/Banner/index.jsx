import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Events, scrollSpy } from 'react-scroll';
import logo from '../../img/logo-white.svg';
import FindYourNavigator from '../FindYourNavigator';
import GotoNext from '../GotoNext';
import banner1440 from './banner-1440.jpeg';
import banner180 from './banner-180.jpeg';
import banner20 from './banner-20.jpeg';
import banner2880 from './banner-2880.jpeg';
import banner360 from './banner-360.jpeg';
import banner45 from './banner-45.jpeg';
import banner720 from './banner-720.jpeg';
import banner90 from './banner-90.jpeg';
import './index.css';

class Banner extends React.Component {
  constructor(props) {
    super(props);
    this.images = {
      20: banner20,
      45: banner45,
      90: banner90,
      180: banner180,
      360: banner360,
      720: banner720,
      1440: banner1440,
      2880: banner2880,
    };

    this.state = {
      size: 20,
      image: this.images[20],
    };

    this.scrollDuration = 1000;
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize(window));
    this.handleResize(window);

    scrollSpy.update();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.handleResize(window));
    Events.scrollEvent.remove('begin');
    Events.scrollEvent.remove('end');
  }

  static get propTypes() {
    return {
      nextActive: PropTypes.func.isRequired,
      nextInactive: PropTypes.func.isRequired,
      next: PropTypes.string.isRequired,
    };
  }

  getImage(window, pixelRatio) {
    const currentSize = this.state.size;
    for (const key in this.images) {
      if (
        window.innerWidth * pixelRatio > this.state.size &&
        key > this.state.size
      ) {
        return Number(key);
      }
    }
    return currentSize;
  }

  handleResize(window) {
    const pixelRatio = window.devicePixelRatio;
    const size = this.getImage(window, pixelRatio);
    if (size != this.state.size) {
      const image = new Image();
      // only show the image once it's loaded
      image.onload = () => {
        this.setState({ size, image: this.images[size] });
        this.handleResize(window);
      };
      // load the image
      image.src = this.images[size];
    } else if (pixelRatio != window.devicePixelRatio) {
      this.handleResize(window, window.devicePixelRatio);
    }
  }

  render() {
    return (
      <section
        id="banner"
        style={{
          backgroundImage: `url(${this.state.image})`,
        }}
        className="backdropped"
      >
        <div className="content">
          <header>
            <h2>
              <img src={logo} className="logo" alt="Windy Road" />
            </h2>
            <p>
              <strong>Your Software Delivery &amp; DevOps Experts</strong>
            </p>
            <p>
              We help you on the road to high quality, efficient, and high
              velocity software delivery.
            </p>
            <FindYourNavigator />
          </header>
        </div>

        <GotoNext
          to={this.props.next}
          onSetActive={this.props.nextActive}
          onSetInactive={this.props.nextInactive}
        />
      </section>
    );
  }
}

export default Banner;
