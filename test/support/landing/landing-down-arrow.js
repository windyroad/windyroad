import clickElement from '../action/clickElement'
import waitForVisible from '../action/waitForVisible'
import PageElement from './page-element'

class LandingDownArrow extends PageElement {
  constructor(selector) {
    super(selector)
    waitForVisible(selector)
    this.element = browser.element(selector)
  }

  click() {
    clickElement('click', 'element', this.element.selector)
    browser.pause(this.element.getAttribute('data-duration'))
  }
}

export default LandingDownArrow
