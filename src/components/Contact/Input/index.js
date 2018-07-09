import React from 'react'
import './index.css'

const DefaultState = Object.freeze({
  failedValidationMsg: null,
  failedValidationMethod: null,
  prevValidationMsg: null,
  hasNotChanged: true,
  isValid: true,
})

class Input extends React.Component {
  constructor(props) {
    super(props)
    this.state = DefaultState

    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.reset = this.reset.bind(this)
    this.isValid = this.isValid.bind(this)
  }

  componentDidMount() {
    this.validate(this.props.value)
    if (this.props.setResetter) {
      this.props.setResetter(this.reset)
    }
    if (this.props.setGetIsValid) {
      this.props.setGetIsValid(this.isValid)
    }
  }

  isValid() {
    return this.state.isValid
  }

  componentWillUnmount() {
    if (this.props.setResetter) {
      this.props.setResetter(null)
    }
  }

  reset() {
    this.setState(prevState => {
      return {
        failedValidationMsg: null,
        failedValidationMethod: null,
        prevValidationMsg: prevState.failedValidationMsg,
        hasNotChanged: true,
        isValid: true,
      }
    })
    this.validate(this.props.value)
  }

  handleChange(event, elem) {
    const target = event.target
    const value = target.value
    const name = target.name
    // if their are validation errors, check validation now,
    // otherwise we'll revalidate after blur
    if (this.state.failedValidationMethod) {
      let errorMsg = this.state.failedValidationMethod(
        target.placeholder,
        value,
      )
      if (errorMsg) {
        this.setState(prevState => ({
          prevValidationMsg: prevState.failedValidationMsg,
          failedValidationMsg: errorMsg,
          hasNotChanged: false,
          isValid: false,
        }))
      } else {
        this.setState(prevState => ({
          prevValidationMsg: prevState.failedValidationMsg,
          failedValidationMsg: null,
          failedValidationMethod: null,
          hasNotChanged: false,
          isValid: true,
        }))
      }
    }
    this.props.onChange(event, elem)
  }

  handleBlur(event, elem) {
    this.setState({
      hasNotChanged: false,
    })
    this.validate(event.target.value)
  }

  handleFocus(event, elem) {}

  showError() {
    return (
      !this.state.isValid &&
      !(this.props.formIsInit && this.state.hasNotChanged)
    )
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
        this.setState(prevState => ({
          prevValidationMsg: prevState.failedValidationMsg,
          failedValidationMsg: errorMsg,
          failedValidationMethod: validationMethod,
          isValid: false,
        }))
        return false
      }
    }
    this.setState(prevState => ({
      prevValidationMsg: prevState.failedValidationMsg,
      failedValidationMsg: null,
      failedValidationMethod: null,
      isValid: true,
    }))
    return true
  }

  render() {
    const field =
      this.props.type == 'textarea' ? (
        <textarea
          type={this.props.type}
          name={this.props.name}
          value={this.props.value}
          placeholder={this.props.placeholder}
          rows={this.props.rows}
          onChange={this.handleChange}
          className={this.showError() ? 'error' : ''}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          autoComplete={this.props.autoComplete}
        />
      ) : (
        <input
          type={this.props.type}
          name={this.props.name}
          value={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          className={this.showError() ? 'error' : ''}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          autoComplete={this.props.autoComplete}
        />
      )
    return (
      <div>
        {field}
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
