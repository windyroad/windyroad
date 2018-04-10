import React from 'react'
import Link from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'

class Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            message: 'Hello',
        }
    }
  handleSetActive() {
  }

  handleSetInactive() {
  }

  contact() {
    console.log('submit');
    return false
  }

  reset() {
      this.setState({
        name: '',
        email: '',
        message: '',
      });
  }

  render() {
    return (
      <section id={this.props.id} className="wrapper style1 special fade">
        <div className="container">
          <header>
            <h2>Find Your Navigator</h2>
          </header>
          <form method="post" onSubmit={() => this.contact()}>
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
                  value={this.state.name}
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
                  value={this.state.email}
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
                  <select name="category" id="category" value="1">
                    <option value="">- Category -</option>
                    <option value="1">General Enquiry</option>
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
                  value={this.state.message}
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
                  onClick={() => this.contact()}
                >
                  Send Message
                  <FontAwesome
                    name="envelope"
                    style={{
                      verticalAlign: 'middle',
                      paddingLeft: '1em'
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
                <a className="button" onClick={() => this.reset()}>reset</a>
              </Col>
            </Row>
          </form>
        </div>
      </section>
    )
  }
}

export default Contact
