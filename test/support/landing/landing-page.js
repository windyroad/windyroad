import waitForVisible from '../action/waitForVisible'
import Header from './landing-header'
import LandingSection from './landing-section'
import Page from './page'

class LandingPage extends Page {
  constructor() {
    super()
    this.header = Header

    this.aboutUs = new LandingSection(`section#about`)
    this.services = new LandingSection(`section#services`)
    this.contact = new LandingSection(`section#contact`)
  }

  get aboutUsSection() {
    this.currentSection = this.aboutUs
    return this.currentSection
  }

  get servicesSection() {
    this.currentSection = this.services
    return this.currentSection
  }

  get contactSection() {
    this.currentSection = this.contact
    return this.currentSection
  }

  open() {
    super.open('/')
    waitForVisible('body.is-loaded')
    // wait for body to have class 'is-loaded' then wait 1.5s for transitions to
    // complete
    browser.pause(1500)
    this.currentSection = new LandingSection(`section#banner`)
  }
}

export default new LandingPage()
