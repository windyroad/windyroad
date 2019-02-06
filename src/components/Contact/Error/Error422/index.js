import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Col, Row } from 'react-flexbox-grid';
import './index.css';

const Error422 = props => (
  <div>
    <div className="form-error-msg">
      <h3>Sorry, something&apos; gone wrong processing your request.</h3>
      <p>
        Please try calling us on <a href="tel:+61285203165">02 8520 3165</a>
      </p>
    </div>
    <Row end="xs" between="xs">
      <Col
        xs={8}
        sm={6}
        smOffset={3}
        md={4}
        mdOffset={4}
        lg={4}
        lgOffset={4}
        style={{
          padding: '1.25em 0.5em 0 0.5em',
        }}
      />
      <Col
        xs={4}
        sm={3}
        md={3}
        mdOffset={1}
        lg={2}
        lgOffset={2}
        style={{
          padding: '1.25em 0.5em 0 0.5em',
          verticalAlign: 'middle',
          height: '100%',
        }}
      >
        <button
          className="button"
          onClick={props.onEdit}
          onKeyPress={props.onEdit}
          style={{
            width: '100%',
          }}
        >
          edit
        </button>
      </Col>
    </Row>
  </div>
);

Error422.propTypes = {
  onEdit: PropTypes.func.isRequired,
};

Error422.defaultProps = {};

export default Error422;
