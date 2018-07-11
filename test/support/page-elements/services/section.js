import LandingSection from '../landing/landing-section'
import Grid from './grid'

class Section extends LandingSection {
  constructor(selector) {
    super(selector)
    this.grid = new Grid(`${selector} .service-items`)
  }

  // get grid() {
  //   return new Grid(`${this.selector} .service-items`)
  // }
}

export default Section
