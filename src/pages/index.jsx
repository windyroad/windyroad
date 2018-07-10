import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import About from '../components/About'
import Banner from '../components/Banner'
import Contact from '../components/Contact'
import Services from '../components/Services'

class IndexPage extends React.Component {
  constructor(props) {
    super(props)
  }

  static get propTypes() {
    return {
      features: PropTypes.shape({
        services: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      }),
    }
  }

  static get defaultProps() {
    return {
      features: {},
    }
  }

  setLoaded() {
    if (this.state.loadState == 'is-loading') {
      this.setState({ loadState: 'is-loaded' })
    }
  }

  handleAboutActive() {
    this.about.handleSetActive()
  }

  handleAboutInactive() {
    this.about.handleSetInactive()
  }

  handleContactActive() {
    this.contact.handleSetActive()
  }

  handleContactInactive() {
    this.contact.handleSetInactive()
  }

  render() {
    const servicesEnabled = this.props.features.services

    const services = servicesEnabled ? (
      <Services
        id="services"
        next="contact"
        ref={section => {
          this.services = section
        }}
        nextActive={() => this.services.handleSetActive()}
        nextInactive={() => this.services.handleSetInactive()}
      />
    ) : (
      ''
    )

    const aboutNext = servicesEnabled ? 'services' : 'contact'

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
            this.about = section
          }}
          next={aboutNext}
          nextActive={() => this.handleContactActive()}
          nextInactive={() => this.handleContactInactive()}
        />
        {services}
        <Contact
          id="contact"
          ref={section => {
            this.contact = section
          }}
        />
      </div>
    )
  }
}

export default IndexPage
