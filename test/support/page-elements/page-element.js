import assert from 'assert';
import clickElement from '../action/clickElement';
import checkContainsText from '../check/checkContainsText';
import checkWithinViewport from '../check/checkWithinViewport';
import Page from './page';

class PageElement extends Page {
  constructor(selector) {
    super();
    this.selector = selector;
    this.element = browser.element(selector);
  }

  checkWithinViewport() {
    checkWithinViewport(this.selector);
  }

  checkAtTopOfPage() {
    const location = browser.getLocation(this.selector);
    expect(location.y).to.equal(0);
  }

  checkContent(content) {
    console.log(
      'browser.element(this.selector).getText()',
      browser.element(this.selector).getText(),
    );

    checkContainsText('element', this.selector, false, content);
  }

  scrollTo() {
    browser.scroll(this.selector);
  }

  moveToObject(xoffset = 0, yoffset = 0) {
    browser;
    browser.moveToObject(this.selector, xoffset, yoffset).pause(500);
  }

  click() {
    clickElement('click', 'element', this.selector);
    browser.pause(this.element.getAttribute('data-duration') || 0);
  }

  checkNotIn(pageElement) {
    const locationStart = pageElement.element.getLocation();
    const size = pageElement.element.getElementSize();
    const locationEnd = {
      x: locationStart.x + size.width,
      y: locationStart.y + size.height,
    };
    const thisLocStart = this.element.getLocation();
    assert(
      thisLocStart.x < locationStart.x ||
        thisLocStart.x > locationEnd.x ||
        thisLocStart.y < locationStart.y ||
        thisLocStart.y > locationEnd.y,
    );
    const thisSize = this.element.getElementSize();
    const thisLocEnd = {
      x: thisLocStart.x + thisSize.width,
      y: thisLocStart.y + thisSize.height,
    };
    assert(
      thisLocEnd.x < locationStart.x ||
        thisLocEnd.x > locationEnd.x ||
        thisLocEnd.y < locationStart.y ||
        thisLocEnd.y > locationEnd.y,
    );
  }
}

export default PageElement;
