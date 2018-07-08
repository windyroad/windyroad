import React from 'react'
import About from '../components/About'
import Banner from '../components/Banner'
import Contact from '../components/Contact'
import Services from '../components/Services'

class IndexPage extends React.Component {
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
          next="services"
          nextActive={() => this.handleContactActive()}
          nextInactive={() => this.handleContactInactive()}
        />
        <Services
          id="services"
          next="contact"
          ref={section => {
            this.services = section
          }}
          nextActive={() => this.services.handleSetActive()}
          nextInactive={() => this.services.handleSetInactive()}
        />
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
