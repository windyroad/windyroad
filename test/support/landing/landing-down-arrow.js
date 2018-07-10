import waitForVisible from '../action/waitForVisible'
import PageElement from './page-element'

class LandingDownArrow extends PageElement {
  constructor(selector) {
    super(selector)
    waitForVisible(selector)
  }
}

export default LandingDownArrow
