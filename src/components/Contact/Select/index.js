import React from 'react'
import Input from '../Input'
import './index.css'

class Select extends Input {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event, elem) {
    console.log("select change", event.target.value.toString().trim().length)
    if (event.target.value.toString().trim().length) {
      super.handleChange(event, elem)
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
        </select>
      </div>
    )
  }
}

export default Select
