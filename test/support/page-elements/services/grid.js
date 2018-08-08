import logger from 'wdio-logger';
import PageElement from '../page-element';
import Tile from './tile';

const log = logger('Grid');
class Grid extends PageElement {
  constructor(props) {
    super(props);

    this.agileAndLeanMentoring = new Tile(
      `${this.selector} .agile-and-lean-mentoring`,
    );
    this.continuousIntegration = new Tile(
      `${this.selector} .continuous-integration`,
    );
    this.productResharpening = new Tile(
      `${this.selector} .product-resharpening`,
    );

    this.testAutomation = new Tile(`${this.selector} .test-automation`);
  }

  getTileForTitle(title) {
    const mapping = {
      'Agile & Lean Mentoring': this.agileAndLeanMentoring,
      'Continuous Integration & Continuous Delivery': this
        .continuousIntegration,
      'Product Resharpening': this.productResharpening,
      'BDD & Test Automation': this.testAutomation,
    };
    expect(mapping).to.have.property(title);
    this.currentTile = mapping[title];
    expect(this.currentTile).to.not.be.undefined;
    log.setLevel('info');
    log.info('this.currentTile', this.currentTile);
    this.currentTile.moveToObject();
    return this.currentTile;
  }
}

export default Grid;
