import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import GotoNext from '../GotoNext'
import './index.css'

class Spotlight extends React.Component {
  constructor(props) {
    super(props)
    this.images = props.images

    for (const key in this.images) {
      this.state = {
        size: key,
        image: this.images[key],
        active: 'active',
      }
      break
    }
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize(window))
    this.handleResize(window)
  }

  componentWillUnmount() {
    this.setState({
      active: 'active',
    })
    window.removeEventListener('resize', () => this.handleResize(window))
  }

  static get propTypes() {
    return {
      images: PropTypes.string.isRequired,
      nextActive: PropTypes.func.isRequired,
      nextInactive: PropTypes.func.isRequired,
      next: PropTypes.string.isRequired,
      children: PropTypes.node.isRequired,
      id: PropTypes.string.isRequired,
      className: PropTypes.string.isRequired,
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
      active: 'active',
    })
  }

  handleSetInactive() {
    this.setState({
      active: 'inactive',
    })
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
        <GotoNext
          to={this.props.next}
          onSetActive={this.props.nextActive}
          onSetInactive={this.props.nextInactive}
        />
      </section>
    )
  }
}

export default Spotlight
