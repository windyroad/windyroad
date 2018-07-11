import logger from 'wdio-logger'
import PageElement from '../page-element'
import Tile from './tile'

const log = logger('Grid')
class Grid extends PageElement {
  constructor(props) {
    super(props)

    this.agileAndLeanMentoringElement = new Tile(
      `${this.selector} .agile-and-lean-mentoring`,
    )
    this.continuousIntegrationElement = new Tile(
      `${this.selector} .continuous-integration`,
    )
    this.productResharpeningElement = new Tile(
      `${this.selector} .product-resharpening`,
    )
  }

  get agileAndLeanMentoring() {
    this.currentTile = this.agileAndLeanMentoringElement
    return this.currentTile
  }

  get continuousIntegration() {
    this.currentTile = this.continuousIntegrationElement
    return this.currentTile
  }

  getTileForTitle(title) {
    const mapping = {
      'Agile & Lean Mentoring': 'agileAndLeanMentoringElement',
      'Continuous Integration & Continuous Delivery':
        'continuousIntegrationElement',
      'Product Resharpening': 'productResharpeningElement',
    }
    expect(mapping).to.have.property(title)
    this.currentTile = this[mapping[title]]
    log.setLevel('info')
    log.info('this.currentTile', this.currentTile)
    return this.currentTile
  }
}

export default Grid
