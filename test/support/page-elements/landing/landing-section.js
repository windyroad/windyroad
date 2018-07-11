import PageElement from '../page-element'
import LandingDownArrow from './landing-down-arrow'

class LandingSection extends PageElement {
  get downArrow() {
    return new LandingDownArrow(`${this.selector} a.goto-next`)
  }

  get heading() {
    return new PageElement(this.selector + ' header')
  }

  get cta() {
    return new PageElement(this.selector + ' .cta')
  }
}

export default LandingSection
