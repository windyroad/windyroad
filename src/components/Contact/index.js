import React from 'react'
import Link from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'

class Contact extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      message: '',
      priority: 'priority-normal',
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleSetActive() {}

  handleSetInactive() {}

  handleSubmit(event) {
    console.log('submit', event)
    event.preventDefault()
  }

  reset() {
    this.setState({
      name: '',
      email: '',
      message: '',
    })
  }
  handleChange(event, elem) {
    console.log(event)
    console.log(event.target.name)
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value,
    })
  }

  render() {
    return (
      <section id={this.props.id} className="wrapper style1 special fade">
        <div className="container">
          <header>
            <h2>Find Your Navigator</h2>
          </header>
          <form method="post" onSubmit={this.handleSubmit}>
            <Row between="xs">
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={this.state.name}
                  placeholder="Name"
                  onChange={this.handleChange}
                />
              </Col>
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={this.state.email}
                  placeholder="Email"
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col
                xs={12}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <div className="select-wrapper">
                  <select
                    name="category"
                    id="category"
                    value={this.state.category}
                    onChange={this.handleChange}
                  >
                    <option value="">- Category -</option>
                    <option value="1">General Enquiry</option>
                  </select>
                </div>
              </Col>
            </Row>
            <Row between="xs" start="xs" center="sm">
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <input
                  type="radio"
                  id="priority-low"
                  name="priority"
                  value="priority-low"
                  checked={this.state.priority == 'priority-low'}
                  onChange={this.handleChange}
                />
                <label htmlFor="priority-low">Low Priority</label>
              </Col>
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <input
                  type="radio"
                  id="priority-normal"
                  name="priority"
                  value="priority-normal"
                  checked={this.state.priority == 'priority-normal'}
                  onChange={this.handleChange}
                />
                <label htmlFor="priority-normal">Normal Priority</label>
              </Col>
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <input
                  type="radio"
                  id="priority-high"
                  name="priority"
                  value="priority-high"
                  checked={this.state.priority == 'priority-high'}
                  onChange={this.handleChange}
                />
                <label htmlFor="priority-high">High Priority</label>
              </Col>
            </Row>
            <Row>
              <Col
                xs={12}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <textarea
                  name="message"
                  id="message"
                  placeholder="Enter your message"
                  rows="6"
                  value={this.state.message}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row end="xs" between="xs">
              <Col
                xs={8}
                sm={6}
                smOffset={3}
                md={4}
                mdOffset={4}
                lg={3}
                lgOffset={5}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <Button
                  style={{
                    fontWeight: '900',
                    verticalAlign: 'middle',
                    width: '100%',
                  }}
                  onClick={this.handleSubmit}
                >
                  Send Message
                  <FontAwesome
                    name="envelope"
                    style={{
                      verticalAlign: 'middle',
                      paddingLeft: '1em',
                    }}
                  />
                </Button>
              </Col>
              <Col
                xs={4}
                sm={3}
                md={3}
                mdOffset={1}
                lg={2}
                lgOffset={2}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                  verticalAlign: 'middle',
                  height: '100%',
                }}
              >
                <a
                  className="button"
                  onClick={() => this.reset()}
                  style={{
                    width: '100%',
                  }}
                >
                  reset
                </a>
              </Col>
            </Row>
          </form>
        </div>
      </section>
    )
  }
}

export default Contact
