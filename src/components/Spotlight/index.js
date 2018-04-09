import React from 'react'
import Link from 'gatsby-link'
import "./index.css"

class SpotlightBottom extends React.Component {
  constructor(props) {
    super(props)
    this.images = props.images

    for (var key in this.images) {
      this.state = {
        size: key,
        image: this.images[key],
        active: '',
      }
      break
    }
  }

  getImage(window, pixelRatio) {
    var currentSize = this.state.size
    for (var key in this.images) {
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
    console.log('in resize')
    var pixelRatio = window.devicePixelRatio
    var size = this.getImage(window, pixelRatio)
    if (size != this.state.size) {
      const image = new Image() // create an image object programmatically
      image.onload = () => {
        // use arrow function here
        this.setState({
          size: size,
          image: this.images[size],
          active: this.state.active,
        });
        console.log('state', this.state)
        this.handleResize(window)
      }
      image.src = this.images[size]
    } else {
      if (pixelRatio != window.devicePixelRatio) {
        this.handleResize(window, window.devicePixelRatio)
      }
    }
  }

  handleSetActive() {
    this.setState({
      size: this.state.size,
      image: this.state.image,
      active: "",
    });

  }

  handleSetInactive() {
    this.setState({
      size: this.state.size,
      image: this.state.image,
      active: 'inactive',
    });

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
    });
    window.removeEventListener('resize', e => this.handleResize(window))
  }

  render() {
    return (
      <section
        id={this.props.id}
        className={this.props.className + ' spotlight ' + this.state.active}
        style={{
          backgroundImage: `url(${this.state.image})`,
        }}
      >
        <div className="content">{this.props.children}</div>
        <a href="#two" className="goto-next scrolly">
          Next
        </a>
      </section>
    )
  }
}

export default SpotlightBottom
