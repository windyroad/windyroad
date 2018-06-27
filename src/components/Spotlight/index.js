import React from 'react'
import FontAwesome from 'react-fontawesome'
import { Link } from 'react-scroll'
import './index.css'

class Spotlight extends React.Component {
  constructor(props) {
    super(props)
    this.images = props.images
    console.log(this.images)

    for (const key in this.images) {
      this.state = {
        size: key,
        image: this.images[key],
        active: 'inactive',
      }
      break
    }
  }

  getImage(window, pixelRatio) {
    const currentSize = this.state.size
    for (const key in this.images) {
      if (
        window.innerWidth * pixelRatio > this.state.size &&
        key > this.state.size
      ) {
        return Number(key)
      }
    }
    return currentSize
  }

  handleResize(window) {
    const pixelRatio = window.devicePixelRatio
    const size = this.getImage(window, pixelRatio)
    if (size != this.state.size) {
      const image = new Image()
      // only display the image once it's loaded
      image.onload = () => {
        this.setState({
          size,
          image: this.images[size],
          active: this.state.active,
        })
        this.handleResize(window)
      }
      // load the image
      image.src = this.images[size]
    } else if (pixelRatio != window.devicePixelRatio) {
      this.handleResize(window, window.devicePixelRatio)
    }
  }

  handleSetActive() {
    this.setState({
      size: this.state.size,
      image: this.state.image,
      active: '',
    })
  }

  handleSetInactive() {
    this.setState({
      size: this.state.size,
      image: this.state.image,
      active: 'inactive',
    })
  }

  componentDidMount() {
    window.addEventListener('resize', e => this.handleResize(window))
    this.handleResize(window)
  }

  componentWillUnmount() {
    this.setState({
      size: this.state.size,
      image: this.state.image,
      active: true,
    })
    window.removeEventListener('resize', e => this.handleResize(window))
  }

  render() {
    return (
      <section
        id={this.props.id}
        className={`${this.props.className} backdropped spotlightx ${
          this.state.active
        }`}
        style={{
          backgroundImage: `url(${this.state.image})`,
        }}
      >
        <div className="content">{this.props.children}</div>
        <Link
          className="goto-next"
          to={this.props.next}
          spy
          smooth
          hashSpy
          duration={1000}
          onSetActive={this.props.nextActive}
          onSetInactive={this.props.nextInactive}
        >
          <FontAwesome name="arrow-circle-o-down" />
        </Link>
      </section>
    )
  }
}

export default Spotlight
