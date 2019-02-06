/* global window */
/* eslint no-undef: "error" */

import '@fortawesome/fontawesome-free/css/all.css';
import Link from 'gatsby-link';
import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import queryString from 'querystring';
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import Helmet from 'react-helmet';
import Footer from '../components/Footer';
import Header from '../components/Header';
import defaultFeatures from '../features';
import themeCss from './css/main.css';

class TemplateWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadState: 'is-loaded',
    };

    const parsedfeatures = Object.assign(
      defaultFeatures,
      queryString.parse(this.props.location.search.substring(1)),
    );
    this.features = {};
    const keys = Object.keys(parsedfeatures);
    for (let i = 0; i < keys.length; i += 1) {
      this.features[keys[i]] =
        parsedfeatures[keys[i]] === true || parsedfeatures[keys[i]] === 'true';
    }

    this.setLoaded = this.setLoaded.bind(this);
  }

  componentDidMount() {
    // console.log('features: ', this.state.features)
    window.addEventListener('load', this.setLoaded);
    // if the load event doesn't fire after a few of seconds,
    // trigger in anyway
    setTimeout(this.setLoaded, 3000);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.setLoaded);
  }

  setLoaded() {
    if (this.state.loadState == 'is-loading') {
      this.setState({ loadState: 'is-loaded' });
    }
  }

  render() {
    const features = this.features;
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
          {/* <Link to={fontAwesomeCss} rel="stylesheet" type="text/css" /> */}
          <Link to={themeCss} rel="stylesheet" type="text/css" />
          <body className={`landing ${this.state.loadState}`} />
        </Helmet>
        <div id="page-wrapper">
          <Header />
          {this.props.children({ ...this.props, features })}
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
};

export default TemplateWrapper;
