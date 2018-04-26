import React from 'react'
import Input from '../Input'
import './index.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Radio from './Radio'


class RadioGroup extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event, elem) {
    let value = event.target.value
    this.props.onChange(value, event, elem);
  }

  render() {
    return (
      <Row between="xs" start="xs" center="sm">
        <Col
          xs={12}
          sm={4}
          style={{
            padding: '1.25em 0.5em 0 0.5em',
          }}
        >
          <Radio value="low" placeholder="Low Priority" group={this}/>
        </Col>
        <Col
          xs={12}
          sm={4}
          style={{
            padding: '1.25em 0.5em 0 0.5em',
          }}
        >
          <Radio value="normal" placeholder="Normal Priority" group={this}/>
        </Col>
        <Col
          xs={12}
          sm={4}
          style={{
            padding: '1.25em 0.5em 0 0.5em',
          }}
        >
          <Radio value="high" placeholder="High Priority" group={this}/>
        </Col>
      </Row>
    )
  }
}

export default RadioGroup
