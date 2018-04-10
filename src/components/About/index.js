import React from 'react'
import './index.css'
import Spotlight from '../Spotlight'
import FindYourNavigator from '../FindYourNavigator'
import { Grid, Row, Col } from 'react-flexbox-grid'

import whiteboard45 from './whiteboard-45.jpeg'
import whiteboard90 from './whiteboard-90.jpeg'
import whiteboard180 from './whiteboard-180.jpeg'
import whiteboard360 from './whiteboard-360.jpeg'
import whiteboard720 from './whiteboard-720.jpeg'
import whiteboard1440 from './whiteboard-1440.jpeg'
import whiteboard2880 from './whiteboard-2880.jpeg'

class About extends React.Component {
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

  handleSetActive() {
    this.spotlight.handleSetActive()
  }

  handleSetInactive() {
    this.spotlight.handleSetInactive()
  }

  render() {
    return (
      <Spotlight
        ref={section => {
          this.spotlight = section
        }}
        id={this.props.id}
        images={this.images}
        className="style1 bottom"
        next={this.props.next}
        nextActive={this.props.nextActive}
        nextInactive={this.props.nextInactive}
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
                Windy Road Technology is a passionate, Sydney based, consulting
                company that can help you navigate the complexities of software
                and product development.
              </p>
            </Col>
          </Row>
          <Row between="xs">
            <Col xs={12} md={7}>
              <p>
                We are experts in high quality, efficient, and high velocity
                software and product delivery. We have many years of experience
                in <i>Continuous Integration</i>, <i>Continuous Delivery</i>,{' '}
                <i>Test Automation</i>, <i>Agile</i>, <i>Lean</i> and{' '}
                <i>Lean Start-up</i> and we have repeatedly, successfully
                pioneered their use within the organisations we work with.
              </p>
            </Col>
            <Col xs={12} mdOffset={1} md={4}>
              <p>
                Our experience can help you avoid the many potholes along the
                way to <i>FAST</i> software and product delivery.
              </p>
              <div
                style={{
                  textAlign: 'center',
                }}
              >
                <FindYourNavigator />
              </div>
            </Col>
          </Row>
        </div>
      </Spotlight>
    )
  }
}

export default About
