import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
const fm = require('../../front-matter')
//const fs = require('fs')

import { withPrefix } from 'gatsby-link'

import themeCss from './css/main.css'

import Header from '../components/Header'
import Banner from '../components/Banner'
import Services from '../components/Services'
import Special from '../components/Special'
import Footer from '../components/Footer'

class TemplateWrapper extends React.Component {
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
          <body />
        </Helmet>
        <div id="page-wrapper">
          <Header headerImage={this.props.data.headerImage} />
          <section>
            <div id="main" className="wrapper style">
              <div className="content">{this.props.children()}</div>
            </div>
          </section>
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

export const pageQuery = graphql`
  query HeaderImageQuery2 {
    headerImage: imageSharp(id: { regex: "/header/" }) {
      resolutions(width: 156, height: 25) {
        ...GatsbyImageSharpResolutions
      }
    }
  }
`
