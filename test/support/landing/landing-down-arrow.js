import clickElement from '../action/clickElement'
import waitForVisible from '../action/waitForVisible'
import checkWithinViewport from '../check/checkWithinViewport'
import Page from './page'

class LandingDownArrow extends Page {
  constructor(selector) {
    super()
    waitForVisible(selector)
    this.element = browser.element(selector)
  }

  checkWithinViewport() {
    checkWithinViewport(this.element.selector)
  }

  click() {
    clickElement('click', 'element', this.element.selector)
    browser.pause(this.element.getAttribute('data-duration'))
  }
}

export default LandingDownArrow
