import React from 'react'
import './index.css'

const DefaultState = Object.freeze({
  failedValidationMsg: null,
  failedValidationMethod: null,
  prevValidationMsg: null,
})

class Input extends React.Component {
  constructor(props) {
    super(props)
    this.state = DefaultState

    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    //this.reset = this.rest.bind(this)
  }

  reset() {
    this.setState(DefaultState)
  }

  handleChange(event, elem) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      value: value,
    })
    // if their are validation errors, check validation now,
    // otherwise we'll revalidate after blur
    if (this.state.failedValidationMethod) {
      let errorMsg = this.state.failedValidationMethod(
        target.placeholder,
        value,
      )
      if (errorMsg) {
        this.setState({
          prevValidationMsg: this.state.failedValidationMsg,
          failedValidationMsg: errorMsg,
          failedValidationMethod: validationMethod,
        })
      } else {
        this.setState({
          prevValidationMsg: this.state.failedValidationMsg,
          failedValidationMsg: null,
          failedValidationMethod: null,
        })
      }
    }
  }

  handleBlur(event, elem) {
    this.validate(event.target.value)
  }

  validate(value) {
    for (
      let index = 0;
      this.props.validations && index < this.props.validations.length;
      index++
    ) {
      const validationMethod = this.props.validations[index]
      let errorMsg = validationMethod(this.props.placeholder, value)
      if (errorMsg) {
        this.setState({
          prevValidationMsg: this.state.failedValidationMsg,
          failedValidationMsg: errorMsg,
          failedValidationMethod: validationMethod,
        })
        return false
      }
    }
    this.setState({
      prevValidationMsg: this.state.failedValidationMsg,
      failedValidationMsg: null,
      failedValidationMethod: null,
    })
    return true
  }

  render() {
    return (
      <div>
        <input
          type={this.props.type}
          name={this.props.name}
          value={this.state.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          className={this.state.failedValidationMsg ? 'error' : ''}
          onBlur={this.handleBlur}
        />
        <div className="error-msg">
          {this.state.failedValidationMsg
            ? this.state.failedValidationMsg
            : this.state.prevValidationMsg}&nbsp;
        </div>
      </div>
    )
  }
}

export default Input
