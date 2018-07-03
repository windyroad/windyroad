import waitForVisible from '../action/waitForVisible'
import Header from './landing-header'
import LandingSection from './landing-section'
import Page from './page'

class LandingPage extends Page {
  constructor() {
    super()
    this.header = Header
  }

  get aboutUsSection() {
    this.currentSection = new LandingSection(`section#about`)
    return this.currentSection
  }

  get servicesSection() {
    this.currentSection = new LandingSection(`section#services`)
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
