import React from 'react'
import './index.css'

const DefaultState = Object.freeze({
  failedValidationMsg: null,
  failedValidationMethod: null,
  prevValidationMsg: null,
  value: 'general-enquiry',
})

class Radio extends React.Component {
  constructor(props) {
    super(props)
    this.state = DefaultState
  }


  render() {
    const groupName = this.props.group.props.name;
    const groupValue = this.props.group.props.value;
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
        <label htmlFor={`${groupName}-${this.props.value}`}>{this.props.placeholder}</label>
      </div>
    )
  }
}

export default Radio
