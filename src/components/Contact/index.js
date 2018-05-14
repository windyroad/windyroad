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
import noInternet from './no-internet.js'
import Error422 from './Error/Error422'
import './index.css'

function uuid(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

const ZD_HOST = 'windyroad.zendesk.com:443'
const ZD_API = `https://${ZD_HOST}/api/v2/requests.json`

const OTHER_HOST = 'google.com.au:443'

let FormStateEnum = Object.freeze({
  READY: 'READY',
  VALIDATING: 'VALIDATING',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
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

const requiredValidation = (name, value) => {
  console.log(name, 'has length', value.toString().trim().length);
  if (!value.toString().trim().length) {
    return `${name} is required`
  }
}

const emailValidation = (name, value) => {
  if (!validator.validate(value)) {
    return `'${value}' is not a valid email.`
  }
}

const DEFAULT_PRIORITY = 'normal'
const DEFAULT_CATEGORY = 'general-enquiry'

const exampleSuccess = {
  request: {
    url: 'https://windyroad.zendesk.com/api/v2/requests/1482.json',
    id: 1482,
    status: 'new',
    priority: null,
    type: null,
    subject: 'general-enquiry',
    description: 'sdsd',
    organization_id: null,
    via: { channel: 'api', source: { from: {}, to: {}, rel: null } },
    custom_fields: [],
    requester_id: 368173136,
    collaborator_ids: [],
    email_cc_ids: [],
    is_public: true,
    due_at: null,
    can_be_solved_by_me: false,
    created_at: '2018-04-30T21:22:20Z',
    updated_at: '2018-04-30T21:22:20Z',
    recipient: null,
    followup_source_id: null,
    assignee_id: null,
    fields: [],
  },
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
    cancelToken: { promise: {} },
    url: 'https://windyroad.zendesk.com/api/v2/requests.json',
    data:
      '{"request":{"requester":{"name":"Tom Howard","email":"tom@windyroad.com.au"},"subject":"general-enquiry","comment":{"body":"Test"},"priority":"low","type":"question"}}',
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
      priority: null,
      category: null,
      form: {
        state: FormStateEnum.READY, //*/ FormStateEnum.VALIDATING,
      },
      ticket: null,
      error: null, //*/ exampleApiError,
    }

    this.resetters = {}
    this.isValids = {}

    this.handleChange = this.handleChange.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.cancelBeforeSend = false
  }

  componentDidMount() {
    //this.checkNetworkStatus()
  }

  async checkNetworkStatus() {
    let offline = await noInternet({
      url: 'https://graph.facebook.com',
      method: 'OPTIONS',
    })
    console.log('offline?', offline)
    let offlineState = {}
    if (offline) {
      offlineState = {
        offline: true,
        zendeskOffline: true,
      }
    } else {
      let zendeskOffline = await noInternet({
        url: ZD_API,
        method: 'POST',
      })
      console.log('zendeskOffline?', zendeskOffline)
      offlineState = {
        offline: false,
        zendeskOffline: zendeskOffline,
      }
    }
    this.setState(offlineState)
    return offlineState
  }

  handleSetActive() {}

  handleSetInactive() {}

  handleCancel(event) {
    if (this.state.formCancel) {
      this.state.formCancel('user cancelled')
    } else {
      // cancelled, but not sent yet
      this.cancelBeforeSend = true
    }
  }

  isValid(formState) {
    let currformState = formState || this.state.form.state;
    if( currformState == FormStateEnum.READY ) {
      return true;
    }
    let keys = Object.keys(this.isValids)
    console.log('validation checks', keys.length);
    for (let i = 0; i < keys.length; ++i) {
      if(!this.isValids[keys[i]]())
      {
        return false;
      }
    }
    return true;
  }

  handleSubmit(event) {
    console.log('submit', event)
    event.preventDefault()

    //this.checkNetworkStatus()

    this.setState(prevState => {
      return {
        category: prevState.category || DEFAULT_CATEGORY,
        priority: prevState.priority || DEFAULT_PRIORITY,
        prevTicket: null,
        prevFormState: null,
        prevError: null,
        prevName: null,
        prevEmail: null,
        prevMessage: null,
        prevCatagory: null,
        prevPriority: null,
        prevError: null,
        xRequestId: uuid(),
        form: {
          state: FormStateEnum.VALIDATING,
        },
      }
    })
    if (!this.isValid(FormStateEnum.VALIDATING)) {
      this.setState({
        form: {
          state: FormStateEnum.VALIDATION_FAILED,
        },
      })
      console.log('Form Invalid')
      return
    }

    if (this.cancelBeforeSend) {
      this.cancelBeforeSend = false
      return
    }
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
      .post(ZD_API, body, {
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
              cancel: progressEvent.cancelable ? prevstate.formCancel : null,
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
      .catch(async error => {
        console.log('Error', JSON.stringify(error))
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
            ticket: null,
            error: error.response,
            form: {
              state: FormStateEnum.RESPONSE_ERROR,
            },
          })
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          let offlineState = await this.checkNetworkStatus()
          error.request.offline = offlineState.offline
          error.request.zendeskOffline = offlineState.zendeskOffline
          this.setState({
            ticket: null,
            error: error.request,
            form: {
              state: FormStateEnum.REQUEST_ERROR,
            },
          })
        } else {
          // Something happened in setting up the request that triggered an Error
          this.setState({
            ticket: null,
            error: error,
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

  async reset() {
    await this.setState(prevState => {
      return {
        name: '',
        email: '',
        message: '',
        priority: null,
        category: null,
        form: {
          state: FormStateEnum.READY,
        },
        ticket: null,
        prevTicket: prevState.ticket,
        prevFormState: prevState.form.state,
        prevError: prevState.error,
        prevName: prevState.name,
        prevEmail: prevState.email,
        prevMessage: prevState.message,
        prevCatagory: prevState.category,
        prevPriority: prevState.priority,
        prevError: prevState.error,
        error: null,
      }
    })
    let resetterKeys = Object.keys(this.resetters)
    for (let i = 0; i < resetterKeys.length; ++i) {
      this.resetters[resetterKeys[i]]()
    }
  }

  handleChange(event, elem) {
    const target = event.target
    const value = target.value
    const name = target.name
    const fieldStateName = `${name}HasNotChanged`;
    this.setState({
      [name]: value,
      [fieldStateName]: false,
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

    let errorConent = ''
    let sendingHeading = 'Sending...'
    if (this.state.error || this.state.prevError) {
      sendingHeading = 'Sending Failed'
      if (
        this.state.form.state == FormStateEnum.REQUEST_ERROR ||
        this.state.prevFormState == FormStateEnum.REQUEST_ERROR
      ) {
        let cause = (
          <div>
            <p>We'll this is a litte embarrasing 😳</p>
            <p>
              Please try calling us on{' '}
              <a href="tel:+61285203165">02 8520 3165</a>
            </p>
          </div>
        )
        if (
          !(this.state.error
            ? this.state.error.offline
            : this.state.prevError.offline) &&
          (this.state.error
            ? this.state.error.zendeskOffline
            : this.state.prevError.zendeskOffline)
        ) {
          cause = (
            <p>
              From what we can tell, our request system is offline. Please try
              again or call us on <a href="tel:+61285203165">02 8520 3165</a>
            </p>
          )
        }
        if (
          this.state.error
            ? this.state.error.offline
            : this.state.prevError.offline
        ) {
          cause = (
            <p>
              From what we can tell, you don't have an internet connection at
              the moment. Please check you connection and try again, or call us
              on <a href="tel:+61285203165">02 8520 3165</a>
            </p>
          )
        }
        errorConent = (
          <div>
            <div className="form-error-msg">
              <h3>Sorry, something's gone wrong sending your request.</h3>
              {cause}
            </div>
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
                  className=""
                  style={{
                    fontWeight: '900',
                    verticalAlign: 'middle',
                    width: '100%',
                  }}
                  onClick={this.handleSubmit}
                >
                  Retry
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
                  onClick={() =>
                    this.setState({ form: { state: FormStateEnum.READY } })
                  }
                  style={{
                    width: '100%',
                  }}
                >
                  edit
                </a>
              </Col>
            </Row>
          </div>
        )
      } else if (
        this.state.form.state == FormStateEnum.RESPONSE_ERROR ||
        this.state.prevFormState == FormStateEnum.RESPONSE_ERROR
      ) {
        console.log('Respone Error', this.state.error)
        console.log(
          '422?',
          this.state.error.status == 422 || this.state.prevError.status == 422,
        )

        if (
          this.state.error.status == 422 ||
          this.state.prevError.status == 422
        ) {
          errorConent = (
            <Error422
              onEdit={() =>
                this.setState(prevState => {
                  return {
                    form: { state: FormStateEnum.READY },
                    prevFormState: prevState.form.state,
                  }
                })
              }
            />
          )
        }
      } else {
        // we should handle the different response codes
        // here, but we'll do that later.
        errorConent = (
          <Error422
            onEdit={() =>
              this.setState(prevState => {
                return {
                  form: { state: FormStateEnum.READY },
                  prevFormState: prevState.form.state,
                }
              })
            }
          />
        )
      }
    }

    let ticket = this.state.ticket
      ? this.state.ticket
      : this.state.prevTicket
        ? this.state.prevTicket
        : {
            id: null,
            subject: null,
            description: null,
          }
    let name = this.state.name ? this.state.name : this.state.prevName
    let email = this.state.email ? this.state.email : this.state.prevEmail

    return (
      <section id={this.props.id} className="wrapper style1 special fade">
        <div className="container">
          <header>
            <h2>Find Your Navigator</h2>
          </header>
          <div
            className={
              'contactForm ' +
              (this.state.ticket ? 'submitted ' : '') +
              this.state.form.state
            }
          >
            <Row>
              <Col xs={4}>
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
                <form method="post" onSubmit={this.handleSubmit}>
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
                        validations={[requiredValidation]}
                        formIsInit={this.state.form.state == FormStateEnum.READY}
                        setResetter={resetter =>
                          (this.resetters['name'] = resetter)
                        }
                        setGetIsValid={isValid => (this.isValids['name'] = isValid)}
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
                        validations={[requiredValidation, emailValidation]}
                        formIsInit={this.state.form.state == FormStateEnum.READY}
                        setResetter={resetter =>
                          (this.resetters['email'] = resetter)
                        }
                        setGetIsValid={isValid => (this.isValids['email'] = isValid)}
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
                        value={this.state.category || DEFAULT_CATEGORY}
                        onChange={this.handleChange}
                        setResetter={resetter =>
                          (this.resetters['category'] = resetter)
                        }
                      />
                    </Col>
                  </Row>
                  <RadioGroup
                    name="priority"
                    value={this.state.priority || DEFAULT_PRIORITY}
                    onChange={this.handleRadioChange}
                    setResetter={resetter =>
                      (this.resetters['priority'] = resetter)
                    }
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
                        validations={[requiredValidation]}
                        value={this.state.message}
                        onChange={this.handleChange}
                        formIsInit={this.state.form.state == FormStateEnum.READY}
                        rows="6"
                        setResetter={resetter =>
                          (this.resetters['message'] = resetter)
                        }
                        setGetIsValid={isValid => (this.isValids['message'] = isValid)}
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
                        className={this.isValid() ? '' : 'error'}
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
                      <div className="error-msg">
                        Please fix the errors above.
                      </div>
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
              </Col>
              <Col xs={4}>
                <h3>{sendingHeading}</h3>
                <div className="table-wrapper" style={{ textAlign: 'left' }}>
                  <table>
                    <tbody>
                      <tr>
                        <th>Name:</th>
                        <td>{this.state.name || this.state.prevName}</td>
                      </tr>
                      <tr>
                        <th>Email:</th>
                        <td>{this.state.email || this.state.prevEmail}</td>
                      </tr>
                      <tr>
                        <th>Catagory:</th>
                        <td>
                          {this.state.category || this.state.prevCatagory}
                        </td>
                      </tr>
                      <tr>
                        <th>Priority:</th>
                        <td>
                          {this.state.priority || this.state.prevPriority}
                        </td>
                      </tr>
                      <tr>
                        <th>Message:</th>
                        <td>{this.state.message || this.state.prevMessage}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {errorConent}{' '}
              </Col>
              <Col xs={4}>
                <div
                  className={this.state.ticket ? 'ticket submitted' : 'ticket'}
                >
                  <h3>Request Sent Successfully</h3>
                  <p>Thanks! We'll respond to your request ASAP.</p>

                  <div className="table-wrapper" style={{ textAlign: 'left' }}>
                    <table>
                      <tbody>
                        <tr>
                          <th>Request&nbsp;ID:</th>
                          <td>
                            <a
                              href={`https://windyroad.zendesk.com/hc/requests/${
                                ticket.id
                              }`}
                            >
                              {ticket.id}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <th>Name:</th>
                          <td>{name}</td>
                        </tr>
                        <tr>
                          <th>Email:</th>
                          <td>{email}</td>
                        </tr>
                        <tr>
                          <th>Catagory:</th>
                          <td>{ticket.subject}</td>
                        </tr>
                        <tr>
                          <th>Message:</th>
                          <td>{ticket.description}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p>A copy of your reqest has also been emailed to {email}.</p>
                  <p>
                    If you would like to provide us with more information, you
                    can simply reply to that email.
                  </p>
                  <a className="button" onClick={() => this.reset()}>
                    reset
                  </a>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    )
  }
}

export default Contact
