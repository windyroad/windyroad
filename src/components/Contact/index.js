import React from 'react'
import Link from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'
import axios from 'axios'
import validator from 'email-validator'
import Input from './Input'
import Select from './Select'
import Radio from './RadioGroup/Radio'
import RadioGroup from './RadioGroup'
import './index.css'

let FormStateEnum = Object.freeze({
  READY: 'READY',
  VALIDATING: 'VALIDATING',
  PRESENDING: 'PRESENDING',
  SENDING: 'SENDING',
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  DONWLOADING: 'DONWLOADING',
  DOWNLOADED: 'DOWNLOADED',
  SENT: 'SENT',
  CANCELED: 'CANCELED',
  RESPONSE_ERROR: 'RESPONSE_ERROR',
  REQUEST_ERROR: 'REQUEST_ERROR',
  GENERAL_ERROR: 'GENERAL_ERROR',
})

const required = (name, value) => {
  if (!value.toString().trim().length) {
    return `${name} is required`
  }
}

const email = (name, value) => {
  if (!validator.validate(value)) {
    return `'${value}' is not a valid email.`
  }
}

const exampleNetworkError = {
  config: {
    transformRequest: {},
    transformResponse: {},
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'post',
    url: 'https://windyroad.zendesk.com/api/v2/requests.json',
    data:
      '{"request":{"requester":{"name":"Tom Howard","email":"tom@windyroad.com.au"},"subject":"general-enquiry","comment":{"body":"asasdasd"},"priority":"normal","type":"question"}}',
  },
  request: {},
}

const exampleApiError = {
  config: {
    transformRequest: {},
    transformResponse: {},
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'post',
    url: 'https://windyroad.zendesk.com/api/v2/requests.json',
    data:
      '{"request":{"requester":{"name":"","email":""},"subject":"","comment":{"body":""},"priority":"normal","type":"question"}}',
  },
  request: {},
  response: {
    data: {
      error: 'RecordInvalid',
      description: 'Record validation errors',
      details: {
        base: [
          {
            description: 'Description: cannot be blank',
            error: 'BlankValue',
            field_key: 'description',
          },
          {
            description: 'Subject: cannot be blank',
            error: 'BlankValue',
            field_key: 'subject',
          },
        ],
        requester: [{ description: 'Requester: Email:  cannot be blank' }],
      },
    },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-cache',
    },
    config: {
      transformRequest: {},
      transformResponse: {},
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'post',
      url: 'https://windyroad.zendesk.com/api/v2/requests.json',
      data:
        '{"request":{"requester":{"name":"","email":""},"subject":"","comment":{"body":""},"priority":"normal","type":"question"}}',
    },
    request: {},
  },
}

class Contact extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      message: '',
      priority: 'normal',
      category: 'general-enquiry',
      form: {
        state: FormStateEnum.READY,
      },
      validations: {},
      prevValidations: {},
    }

    this.resetters = {};

    this.handleChange = this.handleChange.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleValidationChange = this.handleValidationChange.bind(this)
    this.cancelBeforeSend = false
  }
  handleSetActive() {}

  handleSetInactive() {}

  handleCancel(event) {
    if (this.state.form.cancel) {
      this.state.form.cancel('user cancelled')
    } else {
      // cancelled, but not sent yet
      this.cancelBeforeSend = true
    }
  }

  handleSubmit(event) {
    console.log('submit', event)
    event.preventDefault()
    // TODO: Validate Input
    if (this.cancelBeforeSend) {
      this.cancelBeforeSend = false
      return
    }
    this.setState({
      form: {
        state: FormStateEnum.VALIDATING,
      },
    })
    if (this.cancelBeforeSend) {
      this.cancelBeforeSend = false
      return
    }
    // TODO: build request
    const body = {
      request: {
        requester: {
          name: this.state.name,
          email: this.state.email,
        },
        subject: this.state.category,
        comment: { body: this.state.message },
        priority: this.state.priority,
        type: 'question',
      },
    }
    if (this.cancelBeforeSend) {
      this.cancelBeforeSend = false
      return
    }
    this.setState({
      form: {
        state: FormStateEnum.PRESENDING,
      },
    })
    axios
      .post('https://windyroad.zendesk.com/api/v2/requests.json', body, {
        cancelToken: new axios.CancelToken(c => {
          this.setState({
            form: {
              state: FormStateEnum.SENDING,
              cancel: c,
            },
          })
        }),
        onUploadProgress: progressEvent => {
          this.setState((prevstate, props) => ({
            form: {
              state: progressEvent.cancelable
                ? FormStateEnum.UPLOADING
                : FormStateEnum.UPLOADED,
              cancel: progressEvent.cancelable ? prevstate.form.cancel : null,
            },
          }))
          console.log('progressUploadEvent', progressEvent)
        },
        onDownloadProgress: progressEvent => {
          console.log('progressDownloadEvent', progressEvent)
          this.setState({
            form: {
              state:
                progressEvent.lengthComputable &&
                progressEvent.total == progressEvent.loaded
                  ? FormStateEnum.DOWNLOADED
                  : FormStateEnum.DOWNLOADING,
              cancel: null,
            },
          })
        },
      })
      .then(response => {
        console.log(response)
        console.log(response.data.request.url)
        console.log(response.data.request.id)
        //let ticketUrl = `https://windyroad.zendesk.com/hc/requests/${response.data.request.id}`
        this.setState({
          ticket: response.data.request,
          form: {
            state: FormStateEnum.SENT,
          },
        })
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log('Request canceled', error.message)
          this.setState({
            ticket: response.data.request,
            form: {
              state: FormStateEnum.CANCELED,
            },
          })
        }
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('data', error.response.data)
          console.log('status', error.response.status)
          console.log('headers', error.response.headers)
          this.setState({
            ticket: response.data.request,
            form: {
              state: FormStateEnum.RESPONSE_ERROR,
            },
          })
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request)
          this.setState({
            ticket: response.data.request,
            form: {
              state: FormStateEnum.REQUEST_ERROR,
            },
          })
        } else {
          // Something happened in setting up the request that triggered an Error
          this.setState({
            ticket: response.data.request,
            form: {
              state: FormStateEnum.GENERAL_ERROR,
            },
          })
          console.log('Error', error.message)
        }
        console.log(error.config)
      })
    // TODO: render result
  }

  reset() {
    let resetterKeys = Object.keys(this.resetters);
    for( let i = 0; i < resetterKeys.length; ++i) {
        this.resetters[resetterKeys[i]]();
    }
    this.setState({
      name: '',
      email: '',
      message: '',
      priority: 'normal',
      category: 'general-enquiry',
      form: {
        state: 'ready',
      },
      validations: {},
      prevValidations: {},
    })
  }

  handleChange(event, elem) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  handleValidationChange(name, valid, event, elem) {
    console.log(name, valid)
    const target = event.target
    const stateName = `validation-${target.name}`
    this.setState({
      [stateName]: valid,
    })
  }

  handleRadioChange(value, event, elem) {
    const target = event.target
    const name = target.name
    this.setState({
      [name]: value,
    })
  }

  render() {
    console.log('state', this.state)
    const button = this.state.ticket ? (
      <Button
        className="disabled"
        style={{
          fontWeight: '900',
          verticalAlign: 'middle',
          width: '100%',
        }}
        onClick={this.handleSubmit}
      >
        Message Sent
      </Button>
    ) : (
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
    )

    return (
      <section id={this.props.id} className="wrapper style1 special fade">
        <div className="container">
          <header>
            <h2>Find Your Navigator</h2>
          </header>
          <Row>
            <Col
              xs={12}
              sm={6}
              smOffset={3}
              md={4}
              mdOffset={4}
              lg={4}
              lgOffset={4}
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
                href="tel:+61285203165"
              >
                <FontAwesome
                  name="phone"
                  style={{
                    verticalAlign: 'middle',
                    paddingRight: '1em',
                  }}
                />
                02 8520 3165
              </Button>
            </Col>
          </Row>
          <Col
            xs={12}
            sm={6}
            smOffset={3}
            md={4}
            mdOffset={4}
            lg={4}
            lgOffset={4}
            style={{
              padding: '1.25em 0.5em 0 0.5em',
            }}
          >
            or
          </Col>
          <Row />
          <form
            method="post"
            onSubmit={this.handleSubmit}
            className={
              'contactForm ' +
              (this.state.ticket ? 'submitted ' : '') +
              this.state.form.state
            }
          >
            <Row between="xs">
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <Input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={this.state.name}
                  onChange={this.handleChange}
                  validations={[required]}
                  onValidationChange={this.handleValidationChange}
                  setResetter={resetter => this.resetters['name'] = resetter}
                />
              </Col>
              <Col
                xs={12}
                sm={6}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <Input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  validations={[required, email]}
                  onValidationChange={this.handleValidationChange}
                  setResetter={resetter => this.resetters['email'] = resetter}
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
                <Select
                  value={this.state.category}
                  onChange={this.handleChange}
                  setResetter={resetter => this.resetters['category'] = resetter}
                />
              </Col>
            </Row>
            <RadioGroup
              name="priority"
              value={this.state.priority}
              onChange={this.handleRadioChange}
              setResetter={resetter => this.resetters['priority'] = resetter}
              />
            <Row>
              <Col
                xs={12}
                style={{
                  padding: '1.25em 0.5em 0 0.5em',
                }}
              >
                <Input
                  type="textarea"
                  name="message"
                  placeholder="Message"
                  validations={[required]}
                  value={this.state.message}
                  onChange={this.handleChange}
                  onValidationChange={this.handleValidationChange}
                  rows="6"
                  setResetter={resetter => this.resetters['message'] = resetter}
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
                lg={4}
                lgOffset={4}
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
          <div className={this.state.ticket ? 'ticket submitted' : 'ticket'}>
            Woohoo!
          </div>
        </div>
      </section>
    )
  }
}

export default Contact
