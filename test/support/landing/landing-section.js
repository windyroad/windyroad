import checkWithinViewport from '../check/checkWithinViewport'
import LandingDownArrow from './landing-down-arrow'
import Page from './page'

class LandingSection extends Page {
  constructor(selector) {
    super()
    this.selector = selector
  }

  get downArrow() {
    return new LandingDownArrow(`${this.selector} a.goto-next`)
  }

  checkWithinViewport() {
    checkWithinViewport(this.selector)
  }

  scrollTo() {
    browser.scroll(this.selector)
  }
}

export default LandingSection
