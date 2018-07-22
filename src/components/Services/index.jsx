import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import { Col, Row } from 'react-flexbox-grid'
import GotoNext from '../GotoNext'
import AgileAndLeanMentoringTile from './Tile/AgileAndLeanMentoringTile'
import ContinousIntegrationTile from './Tile/ContinousIntegrationTile'
import ProductResharpeningTile from './Tile/ProductResharpeningTile'
import TestAutomationTile from './Tile/TestAutomationTile'

class Services extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.id
  }

  static get propTypes() {
    return {
      id: PropTypes.string.isRequired,
      nextActive: PropTypes.func.isRequired,
      nextInactive: PropTypes.func.isRequired,
      next: PropTypes.string.isRequired,
    }
  }

  handleSetActive() {}

  handleSetInactive() {}

  render() {
    return (
      <section
        className="page-wrapper bot0 spotlightx backdropped"
        {...this.props}
      >
        <div className="content">
          <header>
            <h2>Services</h2>
          </header>
          <div className="service-items">
            <Row>
              <Col xs={12} sm={12} md={6} lg={3}>
                <AgileAndLeanMentoringTile />
              </Col>
              <Col xs={12} sm={12} md={6} lg={3}>
                <ContinousIntegrationTile />
              </Col>
              <Col xs={12} sm={12} md={6} lg={3}>
                <ProductResharpeningTile />
              </Col>
              <Col xs={12} sm={12} md={6} lg={3}>
                <TestAutomationTile />
              </Col>
            </Row>
          </div>
        </div>
        <GotoNext
          to={this.props.next}
          onSetActive={this.props.nextActive}
          onSetInactive={this.props.nextInactive}
        />
      </section>
    )
  }
}

export default Services
