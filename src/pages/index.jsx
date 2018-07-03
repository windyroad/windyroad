import React from 'react'
import About from '../components/About'
import Banner from '../components/Banner'
import Contact from '../components/Contact'

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
          next="contact"
          nextActive={() => this.handleContactActive()}
          nextInactive={() => this.handleContactInactive()}
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
