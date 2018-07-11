import LandingSection from '../landing/landing-section'
import Grid from './grid'

class Section extends LandingSection {
  get grid() {
    return new Grid(`${this.selector} .service-items`)
  }
}

export default Section
