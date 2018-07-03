export default class Page {
  constructor() {
    this.broswer = browser
  }

  open(path) {
    this.path = path
    browser.url(path)
  }
}
