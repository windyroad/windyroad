import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import About from '../components/About';
import Banner from '../components/Banner';
import Contact from '../components/Contact';
import Services from '../components/Services';

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      features: PropTypes.shape({
        services: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      }),
    };
  }

  static get defaultProps() {
    return {
      features: {},
    };
  }

  setLoaded() {
    if (this.state.loadState == 'is-loading') {
      this.setState({ loadState: 'is-loaded' });
    }
  }

  handleAboutActive() {
    if (this.about) {
      this.about.handleSetActive();
    }
  }

  handleAboutInactive() {
    if (this.about) {
      this.about.handleSetInactive();
    }
  }

  handleContactActive() {
    if (this.contact) {
      this.contact.handleSetActive();
    }
  }

  handleContactInactive() {
    if (this.contact) {
      this.contact.handleSetInactive();
    }
  }

  handleServicesActive() {
    if (this.services) {
      this.services.handleSetActive();
    }
  }

  handleServicesInactive() {
    if (this.services) {
      this.services.handleSetInactive();
    }
  }

  render() {
    const servicesEnabled = this.props.features.services;

    const services = servicesEnabled ? (
      <Services
        id="services"
        next="contact"
        ref={section => {
          this.services = section;
        }}
        nextActive={() => this.handleContactActive()}
        nextInactive={() => this.handleContactInactive()}
      />
    ) : (
      ''
    );

    const aboutNext = servicesEnabled ? 'services' : 'contact';

    return (
      <div>
        <Banner
          next="about"
          nextActive={() => this.handleAboutActive()}
          nextInactive={() => this.handleAboutInactive()}
        />
        <About
          id="about"
          ref={section => {
            this.about = section;
          }}
          next={aboutNext}
          nextActive={() =>
            servicesEnabled
              ? this.handleServicesActive()
              : this.handleContactActive()
          }
          nextInactive={() =>
            servicesEnabled
              ? this.handleServicesInactive()
              : this.handleContactInactive()
          }
        />
        {services}
        <Contact
          id="contact"
          ref={section => {
            this.contact = section;
          }}
        />
      </div>
    );
  }
}

export default IndexPage;
