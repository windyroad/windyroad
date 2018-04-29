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
    this.reset = this.reset.bind(this)
  }

  componentDidMount() {
    if (this.props.setResetter) {
      this.props.setResetter(this.reset)
    }
  }

  componentWillUnmount() {
    if (this.props.setResetter) {
      this.props.setResetter(null)
    }
  }

  reset() {
    console.log("resetting")
    this.setState(DefaultState)
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
        }))
        this.props.onValidationChange(event.target.name, false, event, elem)
      } else {
        this.setState(prevState => ({
          prevValidationMsg: prevState.failedValidationMsg,
          failedValidationMsg: null,
          failedValidationMethod: null,
        }))
        this.props.onValidationChange(event.target.name, true, event, elem)
      }
    }
    this.props.onChange(event, elem)
  }

  handleBlur(event, elem) {
    this.validate(event.target.value, event, elem)
  }

  validate(value, event, elem) {
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
        }))
        this.props.onValidationChange(event.target.name, false, event, elem)
        return false
      }
    }
    this.setState(prevState => ({
      prevValidationMsg: prevState.failedValidationMsg,
      failedValidationMsg: null,
      failedValidationMethod: null,
    }))
    this.props.onValidationChange(event.target.name, true, event, elem)
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
          className={this.state.failedValidationMsg ? 'error' : ''}
          onBlur={this.handleBlur}
        />
      ) : (
        <input
          type={this.props.type}
          name={this.props.name}
          value={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          className={this.state.failedValidationMsg ? 'error' : ''}
          onBlur={this.handleBlur}
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
