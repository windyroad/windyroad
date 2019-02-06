import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import Input from '../Input';
import './index.css';

class Select extends Input {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, elem) {
    if (event.target.value.toString().trim().length) {
      super.handleChange(event, elem);
    }
  }

  render() {
    return (
      <div className="select-wrapper">
        <select
          name="category"
          id="category"
          value={this.props.value}
          onChange={this.handleChange}
        >
          <option value="">- Category -</option>
          <option value="general-enquiry">General Enquiry</option>
          <option value="agile-&amp;-lean-mentoring">
            Agile &amp; Lean Mentoring
          </option>
          <option value="ci/cd">
            Continuous Integration &amp; Continuous Delivery
          </option>
          <option value="product-resharpening">Product Resharpening</option>
          <option value="test-automation">Test Automation</option>
        </select>
      </div>
    );
  }
}

Select.propTypes = {
  value: PropTypes.string.isRequired,
  setResetter: PropTypes.func.isRequired,
  setGetIsValid: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  formIsInit: PropTypes.bool.isRequired,
  validations: PropTypes.arrayOf(PropTypes.func).isRequired,
  placeholder: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  autoComplete: PropTypes.bool,
};

Select.defaultProps = {
  autoComplete: true,
};

export default Select;
