import checkContainsText from '../check/checkContainsText'
import checkWithinViewport from '../check/checkWithinViewport'
import Page from './page'

class PageElement extends Page {
  constructor(selector) {
    super()
    this.selector = selector
  }

  checkWithinViewport() {
    checkWithinViewport(this.selector)
  }

  checkAtTopOfPage() {
    const location = browser.getLocation(this.selector)
    expect(location.y).to.equal(0)
  }

  checkContent(content) {
    checkContainsText('element', this.selector, false, content)
  }

  scrollTo() {
    browser.scroll(this.selector)
  }
}

export default PageElement
