import PageElement from '../page-element'
import Tile from './tile'

class Grid extends PageElement {
  get agileAndLeanMentoring() {
    return new Tile(`${this.selector} .agile-and-lean-mentoring`)
  }
}

export default Grid
