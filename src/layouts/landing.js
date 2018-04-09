import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import { withPrefix } from 'gatsby-link'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontAwesome from 'react-fontawesome'

import themeCss from './css/main.css'

import Header from '../components/Header'
import Banner from '../components/Banner'
import Spotlight from '../components/Spotlight'
import Button from '../components/Button'
import FindYourNavigator from '../components/FindYourNavigator'
import Services from '../components/Services'
import Special from '../components/Special'
import Footer from '../components/Footer'
import About from '../components/About'

class TemplateWrapper extends React.Component {
  constructor(props) {
    super(props)
  }

  handleAboutActive() {
    this.about.handleSetActive()
  }

  handleAboutInactive() {
    this.about.handleSetInactive()
  }

  render() {
    return (
      <div>
        <Helmet
          title="Windy Road"
          meta={[
            { name: 'description', content: 'Windy Road' },
            { name: 'keywords', content: 'consulting, IT, scrum' },
          ]}
        >
          <Link to={themeCss} rel="stylesheet" type="text/css" />
          <body className="landing" />
        </Helmet>
        <div id="page-wrapper">
          <Header />
          <Banner
            next="about"
            nextActive={() => this.handleAboutActive()}
            nextInactive={() => this.handleAboutInactive()}
          />
          <About id="about" ref={section => {
              this.about = section
            }}/>
          <Services />
          <Special />
          {this.props.children()}
          <Footer />
        </div>
      </div>
    )
  }
}
TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
