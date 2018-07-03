/* global window */
/* eslint no-undef: "error" */

// import fontAwesomeCss from '@fortawesome/fontawesome-free/css/all.css'
import Link from 'gatsby-link'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import About from '../components/About'
import Banner from '../components/Banner'
import Contact from '../components/Contact'
// import Services from '../components/Services' import Special from
// '../components/Special'
import Footer from '../components/Footer'
import Header from '../components/Header'
import themeCss from './css/main.css'

class TemplateWrapper extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loadState: 'is-loading',
    }

    this.setLoaded = this.setLoaded.bind(this)
  }

  componentDidMount() {
    window.addEventListener('load', this.setLoaded)
    // if the load event doesn't fire after a few of seconds,
    // trigger in anyway
    setTimeout(this.setLoaded, 3000)
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.setLoaded)
  }

  setLoaded() {
    console.log('Landing Page Loaded')
    if (this.state.loadState == 'is-loading') {
      this.setState({ loadState: 'is-loaded' })
    }
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
            {
              name: 'description',
              content: 'Windy Road',
            },
            {
              name: 'keywords',
              content: 'consulting, IT, scrum',
            },
          ]}
        >
          {/* <script src="https://cdn.optimizely.com/js/105401733.js" /> */}
          <script type="text/javascript" id="inspectletjs">
            {(function() {
              if (typeof window !== 'undefined') {
                const insp_ab_loader = true // set this boolean to false to disable the A/B testing loader
                window.__insp = window.__insp || []
                __insp.push(['wid', 1654706623])
                const ldinsp = function() {
                  if (typeof window.__inspld !== 'undefined') return
                  window.__inspld = 1
                  const insp = document.createElement('script')
                  insp.type = 'text/javascript'
                  insp.async = true
                  insp.id = 'inspsync'
                  insp.src = `${
                    document.location.protocol == 'https:' ? 'https' : 'http'
                  }://cdn.inspectlet.com/inspectlet.js?wid=1654706623&r=${Math.floor(
                    new Date().getTime() / 3600000,
                  )}`
                  const x = document.getElementsByTagName('script')[0]
                  x.parentNode.insertBefore(insp, x)
                  if (typeof insp_ab_loader !== 'undefined' && insp_ab_loader) {
                    const adlt = function() {
                      const e = document.getElementById('insp_abl')
                      if (e) {
                        e.parentNode.removeChild(e)
                        __insp.push(['ab_timeout'])
                      }
                    }
                    const adlc = 'body{ visibility: hidden !important; }'
                    const adln =
                      typeof insp_ab_loader_t !== 'undefined'
                        ? insp_ab_loader_t
                        : 1200
                    insp.onerror = adlt
                    const abti = setTimeout(adlt, adln)
                    window.__insp_abt = abti
                    const abl = document.createElement('style')
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
          {/* <Link to={fontAwesomeCss} rel="stylesheet" type="text/css" /> */}
          <Link to={themeCss} rel="stylesheet" type="text/css" />
          <body className={`landing ${this.state.loadState}`} />
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
