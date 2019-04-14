/* global window */
/* eslint no-undef: "error" */

import '@fortawesome/fontawesome-free/css/all.css';
import Link from 'gatsby-link';
import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import Footer from '../components/Footer';
import Header from '../components/Header';
import themeCss from './css/main.css';

class TemplateWrapper extends React.Component {
  constructor({ children, location, loaderEnabled }) {
    super({ children, location });

    this.state = {
      loadState: loaderEnabled ? 'is-loading' : 'is-loaded',
    };

    this.setLoaded = this.setLoaded.bind(this);
  }

  componentDidMount() {
    // console.log('features: ', this.state.features)
    window.addEventListener('load', () => {
      this.setLoaded();
    });
    // if the load event doesn't fire after a few of seconds,
    // trigger in anyway
    setTimeout(this.setLoaded, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.setLoaded);
  }

  setLoaded() {
    const { loadState } = this.state;
    if (loadState == 'is-loading') {
      this.setState({ loadState: 'is-loaded' });
    }
  }

  render() {
    const { loadState } = this.state;
    const { children } = this.props;
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
              content: 'consulting, IT, scrum, devops, agile, lean',
            },
          ]}
        >
          <script type="text/javascript" id="inspectletjs">
            {(function() {
              if (
                typeof window !== 'undefined' &&
                document.location.hostname == 'windyroad.com.au'
              ) {
                const insp_ab_loader = true; // set this boolean to false to disable the A/B testing loader
                window.__insp = window.__insp || [];
                window.__insp.push(['wid', 1654706623]);
                const ldinsp = function() {
                  if (typeof window.__inspld !== 'undefined') return;
                  window.__inspld = 1;
                  const insp = document.createElement('script');
                  insp.type = 'text/javascript';
                  insp.async = true;
                  insp.id = 'inspsync';
                  insp.src = `${
                    document.location.protocol == 'https:' ? 'https' : 'http'
                  }://cdn.inspectlet.com/inspectlet.js?wid=1654706623&r=${Math.floor(
                    new Date().getTime() / 3600000,
                  )}`;
                  const x = document.getElementsByTagName('script')[0];
                  x.parentNode.insertBefore(insp, x);
                  if (typeof insp_ab_loader !== 'undefined' && insp_ab_loader) {
                    const adlt = function() {
                      const e = document.getElementById('insp_abl');
                      if (e) {
                        e.parentNode.removeChild(e);
                        window.__insp.push(['ab_timeout']);
                      }
                    };
                    const adlc = 'body{ visibility: hidden !important; }';
                    const adln =
                      typeof window.insp_ab_loader_t !== 'undefined'
                        ? window.insp_ab_loader_t
                        : 1200;
                    insp.onerror = adlt;
                    const abti = setTimeout(adlt, adln);
                    window.__insp_abt = abti;
                    const abl = document.createElement('style');
                    abl.id = 'insp_abl';
                    abl.type = 'text/css';
                    if (abl.styleSheet) abl.styleSheet.cssText = adlc;
                    else abl.appendChild(document.createTextNode(adlc));
                    document.head.appendChild(abl);
                  }
                };
                setTimeout(ldinsp, 0);
              }
            })()}
          </script>

          <Link to={themeCss} rel="stylesheet" type="text/css" />
          <body className={`landing ${loadState}`} />
        </Helmet>
        <div id="page-wrapper">
          <Header />
          {children}
          <Footer />
        </div>
      </div>
    );
  }
}

TemplateWrapper.propTypes = {
  children: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  loaderEnabled: PropTypes.bool,
};

TemplateWrapper.defaultProps = {
  loaderEnabled: false,
};

export default TemplateWrapper;
