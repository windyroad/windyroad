import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import { withPrefix } from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'

import themeCss from './css/main.css'

import Header from '../components/Header'
import Banner from '../components/Banner'
import Spotlight from '../components/Spotlight'
import Button from '../components/Button'
import FindYourNavigator from '../components/FindYourNavigator'
import Services from '../components/Services'
import Special from '../components/Special'
import Footer from '../components/Footer'

import whiteboard45 from './images/whiteboard-45.jpeg'
import whiteboard90 from './images/whiteboard-90.jpeg'
import whiteboard180 from './images/whiteboard-180.jpeg'
import whiteboard360 from './images/whiteboard-360.jpeg'
import whiteboard720 from './images/whiteboard-720.jpeg'
import whiteboard1440 from './images/whiteboard-1440.jpeg'
import whiteboard2880 from './images/whiteboard-2880.jpeg'

class TemplateWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.images = {
      45: whiteboard45,
      90: whiteboard90,
      180: whiteboard180,
      360: whiteboard360,
      720: whiteboard720,
      1440: whiteboard1440,
      2880: whiteboard2880,
    }
  }

  handleAboutActive() {
    this.about.handleSetActive()
  }

  handleAboutInactive() {
    this.about.handleSetInactive()
  }

  render() {
    return (
      <div>
        <Helmet
          title="Windy Road"
          meta={[
            { name: 'description', content: 'Windy Road' },
            { name: 'keywords', content: 'consulting, IT, scrum' },
          ]}
        >
          <Link to={themeCss} rel="stylesheet" type="text/css" />
          <body className="landing" />
        </Helmet>
        <div id="page-wrapper">
          <Header />
          <Banner
            next="about"
            nextActive={() => this.handleAboutActive()}
            nextInactive={() => this.handleAboutInactive()}
          />
          <Spotlight
            ref={section => {
              this.about = section
            }}
            id="about"
            images={this.images}
            className="style1 bottom"
          >
            <div
              style={{
                paddingLeft: '5%',
                paddingRight: '5%',
              }}
            >
              <Row between="xs">
                <Col xs={3} sm={3} md={4} lg={3}>
                  <header>
                    <h2>A Little About Us</h2>
                  </header>
                </Col>
                <Col
                  xs
                  style={{
                    fontSize: 'larger',
                  }}
                >
                  <p>
                    Windy Road Technology is a passionate, Sydney based,
                    consulting company that can help you navigate the
                    complexities of software and product development.
                  </p>
                </Col>
              </Row>
              <Row between="xs">
                <Col xs={12} md={7}>
                  <p>
                    We are experts in high quality, efficient, and high velocity
                    software and product delivery. We have many years of
                    experience in <i>Continuous Integration</i>,{' '}
                    <i>Continuous Delivery</i>, <i>Test Automation</i>,{' '}
                    <i>Agile</i>, <i>Lean</i> and <i>Lean Start-up</i> and we
                    have repeatedly, successfully pioneered their use within the
                    organisations we work with.
                  </p>
                </Col>
                <Col xs={12} mdOffset={1} md={4}>
                  <p>
                    Our experience can help you avoid the many potholes along
                    the way to <i>FAST</i> software and product delivery.
                  </p>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <FindYourNavigator/>
                  </div>
                </Col>
              </Row>
            </div>
          </Spotlight>
          <Services />
          <Special />
          {this.props.children()}
          <Footer />
        </div>
      </div>
    )
  }
}
TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
