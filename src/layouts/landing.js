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
// import Services from '../components/Services'
// import Special from '../components/Special'
import Footer from '../components/Footer'
import About from '../components/About'
import Contact from '../components/Contact'

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

  handleContactActive() {
    this.contact.handleSetActive()
  }

  handleContactInactive() {
    this.contact.handleSetInactive()
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
          <script src="https://cdn.optimizely.com/js/105401733.js" />
          <script type="text/javascript" id="inspectletjs">
            {(function() {
              if (typeof window !== 'undefined') {
                var insp_ab_loader = true // set this boolean to false to disable the A/B testing loader
                window.__insp = window.__insp || []
                __insp.push(['wid', 1654706623])
                var ldinsp = function() {
                  if (typeof window.__inspld != 'undefined') return
                  window.__inspld = 1
                  var insp = document.createElement('script')
                  insp.type = 'text/javascript'
                  insp.async = true
                  insp.id = 'inspsync'
                  insp.src =
                    ('https:' == document.location.protocol
                      ? 'https'
                      : 'http') +
                    '://cdn.inspectlet.com/inspectlet.js?wid=1654706623&r=' +
                    Math.floor(new Date().getTime() / 3600000)
                  var x = document.getElementsByTagName('script')[0]
                  x.parentNode.insertBefore(insp, x)
                  if (typeof insp_ab_loader != 'undefined' && insp_ab_loader) {
                    var adlt = function() {
                      var e = document.getElementById('insp_abl')
                      if (e) {
                        e.parentNode.removeChild(e)
                        __insp.push(['ab_timeout'])
                      }
                    }
                    var adlc = 'body{ visibility: hidden !important; }'
                    var adln =
                      typeof insp_ab_loader_t != 'undefined'
                        ? insp_ab_loader_t
                        : 1200
                    insp.onerror = adlt
                    var abti = setTimeout(adlt, adln)
                    window.__insp_abt = abti
                    var abl = document.createElement('style')
                    abl.id = 'insp_abl'
                    abl.type = 'text/css'
                    if (abl.styleSheet) abl.styleSheet.cssText = adlc
                    else abl.appendChild(document.createTextNode(adlc))
                    document.head.appendChild(abl)
                  }
                }
                setTimeout(ldinsp, 0)
              }
            })()}
          </script>
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
          <About
            id="about"
            ref={section => {
              this.about = section
            }}
            next="contact"
            nextActive={() => this.handleContactActive()}
            nextInactive={() => this.handleContactInactive()}
          />
          <Contact
            id="contact"
            ref={section => {
              this.contact = section
            }}
          />

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
