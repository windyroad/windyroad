import React from 'react'
//import Link from 'gatsby-link'
import Img from 'gatsby-image'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from 'react-scroll'

import './index.css'

import banner20 from './banner-20.jpeg'
import banner45 from './banner-45.jpeg'
import banner90 from './banner-90.jpeg'
import banner180 from './banner-180.jpeg'
import banner360 from './banner-360.jpeg'
import banner720 from './banner-720.jpeg'
import banner1440 from './banner-1440.jpeg'
import banner2880 from './banner-2880.jpeg'
import logo from './logo-white.svg'

class Banner extends React.Component {
  constructor(props) {
    super(props)
    this.images = {
      20: banner20,
      45: banner45,
      90: banner90,
      180: banner180,
      360: banner360,
      720: banner720,
      1440: banner1440,
      2880: banner2880,
    }

    this.state = {
      size: 20,
      image: this.images[20],
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
        })
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

  componentDidMount() {
    window.addEventListener('resize', e => this.handleResize(window))
    this.handleResize(window)

    Events.scrollEvent.register('begin', function(to, element) {
      console.log('begin', arguments)
    })

    Events.scrollEvent.register('end', function(to, element) {
      console.log('end', arguments)
    })

    scrollSpy.update()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', e => this.handleResize(window))
    Events.scrollEvent.remove('begin')
    Events.scrollEvent.remove('end')
  }

  render() {
    console.log(`props:`, this.props)
    return (
      <section
        id="banner"
        style={{
          backgroundImage: `url(${this.state.image})`,
        }}
      >
        <div className="content">
          <header>
            <h2>
              <img src={logo} className="logo" />
            </h2>
            <p>We help you stay on course</p>
            <Button
              style={{
                fontWeight: '900',
                verticalAlign: 'middle',
              }}
            >
              Find your navigator{' '}
              <FontAwesome
                name="random"
                style={{
                  verticalAlign: 'middle',
                }}
              />
            </Button>
          </header>
        </div>
        <Link
          className="goto-next"
          to={this.props.next}
          spy={true}
          smooth={true}
          hashSpy={true}
          duration={1000}
        >
          next
        </Link>
      </section>
    )
  }
}

export default Banner
