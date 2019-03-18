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
    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div>
        <input
          type="radio"
          id={`${groupName}-${this.props.value}`}
          name={groupName}
          value={this.props.value}
          checked={groupValue == this.props.value}
          onChange={this.props.group.handleChange}
        />
        <label htmlFor={`${groupName}-${this.props.value}`}>
          {this.props.placeholder}
        </label>
      </div>
    );
    /* eslint-enable jsx-a11y/label-has-for */
  }
}

Radio.propTypes = {
  group: PropTypes.objectOf({
    group: PropTypes.objectOf({ name: PropTypes.string }),
  }).isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
};

Radio.defaultProps = {};

export default Radio;
