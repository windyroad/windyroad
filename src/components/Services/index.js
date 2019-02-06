import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Col, Row } from 'react-flexbox-grid';
import GotoNext from '../GotoNext';
import './index.css';
import AgileAndLeanMentoringTile from './Tile/AgileAndLeanMentoringTile';
import ContinousIntegrationTile from './Tile/ContinousIntegrationTile';
import ProductResharpeningTile from './Tile/ProductResharpeningTile';
import TestAutomationTile from './Tile/TestAutomationTile';

class Services extends React.Component {
  constructor(props) {
    super(props);
    this.id = props.id;
    this.state = {
      active: 'active',
    };
  }

  handleSetActive() {
    this.setState({
      active: 'active',
    });
  }

  handleSetInactive() {
    this.setState({
      active: 'inactive',
    });
  }

  render() {
    const { className, ...props } = this.props;
    const classes = [this.state.active].concat(className).join(' ');
    return (
      <section
        className={`${classes}`}
        // className="page-wrapper bot0 spotlightx backdropped"
        {...props}
      >
        <div className="content">
          <header>
            <h2>Services</h2>
          </header>
          <div className="service-items">
            <Row>
              <Col xs={12} sm={6} md={6} lg={4} xl={3} style={{ padding: `0` }}>
                <AgileAndLeanMentoringTile />
              </Col>
              <Col xs={12} sm={6} md={6} lg={4} xl={3} style={{ padding: `0` }}>
                <ContinousIntegrationTile />
              </Col>
              <Col xs={12} sm={6} md={6} lg={4} xl={3} style={{ padding: `0` }}>
                <ProductResharpeningTile />
              </Col>
              <Col
                xs={12}
                sm={6}
                md={6}
                lg={4}
                xl={3}
                lgOffset={4}
                xlOffset={0}
                style={{ padding: `0` }}
              >
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
    );
  }
}

Services.propTypes = {
  id: PropTypes.string.isRequired,
  nextActive: PropTypes.func.isRequired,
  nextInactive: PropTypes.func.isRequired,
  next: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Services.defaultProps = {
  className: null,
};

export default Services;
