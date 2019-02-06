import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import './index.css';

const DefaultState = Object.freeze({
  failedValidationMsg: null,
  failedValidationMethod: null,
  prevValidationMsg: null,
  value: 'general-enquiry',
});

class Radio extends React.Component {
  constructor(props) {
    super(props);
    this.state = DefaultState;
  }

  render() {
    const groupName = this.props.group.props.name;
    const groupValue = this.props.group.props.value;
    return (
      <div>
        <label htmlFor={`${groupName}-${this.props.value}`}>
          {this.props.placeholder}
          <input
            type="radio"
            id={`${groupName}-${this.props.value}`}
            name={groupName}
            value={this.props.value}
            checked={groupValue == this.props.value}
            onChange={this.props.group.handleChange}
          />
        </label>
      </div>
    );
  }
}

Radio.propTypes = {
  group: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
};

Radio.defaultProps = {};

export default Radio;
