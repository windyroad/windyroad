import React from 'react'
import Link from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'

class Contact extends React.Component {
  contact() {
    return false
  }

  render() {
    return (
      <section id={this.props.id} className="wrapper style1 special fade">
        <div className="container">
          <header>
            <h2>Find Your Navigator</h2>
          </header>
          <form method="post" onClick={() => this.contact()}>
            <Row between="xs">
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <input
                  type="text"
                  name="name"
                  id="name"
                  value=""
                  placeholder="Name"
                />
              </Col>
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <input
                  type="email"
                  name="email"
                  id="email"
                  value=""
                  placeholder="Email"
                />
              </Col>
            </Row>
            <Row>
              <Col
                xs={12}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <div class="select-wrapper">
                  <select name="category" id="category">
                    <option value="">- Category -</option>
                    <option value="1">Manufacturing</option>
                    <option value="1">Shipping</option>
                    <option value="1">Administration</option>
                    <option value="1">Human Resources</option>
                  </select>
                </div>
              </Col>
            </Row>
            <Row between="xs">
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0 0 1.25em',
                  textAlign: 'left',
                }}
              >
                <input
                  type="radio"
                  id="priority-low"
                  name="priority"
                  checked=""
                />
                <label for="priority-low">Low Priority</label>
              </Col>
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <input type="radio" id="priority-normal" name="priority" />
                <label for="priority-normal">Normal Priority</label>
              </Col>
              <Col
                xs={12}
                sm={4}
                style={{
                  padding: '1.25em 0 0 1.25em',
                  textAlign: 'right',
                }}
              >
                <input type="radio" id="priority-high" name="priority" />
                <label for="priority-high">High Priority</label>
              </Col>
            </Row>
            <Row>
              <Col
                xs={12}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <textarea
                  name="message"
                  id="message"
                  placeholder="Enter your message"
                  rows="6"
                />
              </Col>
            </Row>
            <Row end="xs">
              <Col
                xs={2}
                xsOffset={5}
                style={{
                  padding: '1.25em 0 0 1.25em',
                }}
              >
                <Button
                  style={{
                    fontWeight: '900',
                    verticalAlign: 'middle',
                  }}
                >
                  Send Message{' '}
                  <FontAwesome
                    name="envelope"
                    style={{
                      verticalAlign: 'middle',
                    }}
                  />
                </Button>
              </Col>
              <Col 
                xs={2}
                xsOffset={3}
                style={{
                  padding: '1.25em 0 0 1.25em',
                  verticalAlign: 'middle',
                  height: '100%',
                }}
              >
                <a className="button">reset</a>
              </Col>
            </Row>
          </form>
        </div>
      </section>
    )
  }
}

export default Contact
