import PageElement from '../page-element'

class Tile extends PageElement {
  get heading() {
    return new PageElement(`${this.selector} header`)
  }

  get excerpt() {
    return new PageElement(`${this.selector} .excerpt`)
  }
}

export default Tile
