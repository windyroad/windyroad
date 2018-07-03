import checkWithinViewport from '../check/checkWithinViewport'
import Page from './page'

class LandingHeader extends Page {
  constructor() {
    super()
    this.selector = 'header#header'
  }

  checkWithinViewport() {
    checkWithinViewport(this.selector)
  }

  checkAtTopOfPage() {
    const location = browser.getLocation(this.selector)
    expect(location.y).to.equal(0)
  }
}

export default new LandingHeader()
