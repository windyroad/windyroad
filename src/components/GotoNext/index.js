import React from 'react'
import FontAwesome from 'react-fontawesome'
import { Link } from 'react-scroll'
import './index.css'

class GotoNext extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      click: false,
    }

    this.clickStart = this.clickStart.bind(this)
    this.clickEnd = this.clickEnd.bind(this)
  }

  componentDidMount() {}

  componentWillUnmount() {}

  clickStart() {
    this.setState({ click: true })
    return true
  }

  clickEnd() {
    this.setState({ click: false })
    return true
  }

  render() {
    const scrollDuration = 1000
    return (
      <Link
        className={`goto-next ${this.state.click ? ' click' : ''}`}
        to={this.props.to}
        spy
        smooth
        hashSpy
        duration={scrollDuration}
        onSetActive={this.props.onSetActive}
        onSetInactive={this.props.onSetActive}
        data-duration={scrollDuration}
        // onMouseDown={this.clickStart}
        onTouchStart={this.clickStart}
        // onMouseUp={this.clickEnd}
        onTouchEnd={this.clickEnd}
        // onClick={() => {
        //   console.log('clicked')
        // }}
      >
        <FontAwesome name="arrow-circle-o-down" />
      </Link>
    )
  }
}

export default GotoNext
