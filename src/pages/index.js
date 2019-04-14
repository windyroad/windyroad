import PropTypes from 'prop-types';
import queryString from 'querystring';
import React from 'react';
import About from '../components/About';
import Banner from '../components/Banner';
import Contact from '../components/Contact';
import Services from '../components/Services';
import defaultFeatures from '../features';
import Layout from '../layouts/index';

class IndexPage extends React.Component {
  constructor(props) {
    super(props);

    const parsedfeatures = Object.assign(
      defaultFeatures,
      queryString.parse(props.location.search.substring(1)),
    );
    this.features = {};
    const keys = Object.keys(parsedfeatures);
    for (let i = 0; i < keys.length; i += 1) {
      this.features[keys[i]] =
        parsedfeatures[keys[i]] === true || parsedfeatures[keys[i]] === 'true';
    }
  }

  setLoaded() {
    const { loadState } = this.state;
    if (loadState == 'is-loading') {
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
    const servicesEnabled = this.features.services;

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
    const { location } = this.props;

    return (
      <Layout location={location} loaderEnabled>
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
      </Layout>
    );
  }
}

IndexPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default IndexPage;
