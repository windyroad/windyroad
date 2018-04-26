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
    console.log('radio props', this.props);
    console.log('radio props group', this.props.group);
    const groupName = this.props.group ? this.props.group.props.name : 'TBC';
    const groupValue = this.props.group ? this.props.group.state.value : '';
    const onChange = this.props.group ? this.props.group.handleChange : (() => { return; });
    return (
      <div>
        <input
          type="radio"
          id={`${groupName}-${this.props.value}`}
          name={groupName}
          value={this.props.value}
          checked={groupValue == this.props.value}
          onChange={onChange}
        />
        <label htmlFor={`${groupName}-${this.props.value}`}>{this.props.placeholder}</label>
      </div>
    )
  }
}

export default Radio
/*
          id={`${this.props.group.props.name}-${this.props.value}`}
          name={this.props.group.props.name}
          value={this.props.value}
          checked={this.props.group.state.value == this.props.value}
          onChange={this.props.group.handleChange}
*/