import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Link } from 'react-scroll';
import './index.css';

class Tile extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <article className={`${this.props.className} service-item`}>
        <Link
          to="contact"
          spy
          smooth
          hashSpy
          duration={1000}
          data-duration={1000}
          // onClick={() => this.setTopic(this.props.topic)}
        >
          <img src={this.props.background} alt="" />
          <div className="overlay">
            <div className="outside">
              <div className="inside">
                <div className="overlay-child">
                  <FontAwesomeIcon icon={this.props.icon} size="2x" />
                  <h3>{this.props.title}</h3>
                  <span className="excerpt">{this.props.excerpt}</span>
                </div>
              </div>
              {/* <FindYourNavigator topic={this.props.topic} /> */}
            </div>
          </div>
        </Link>
      </article>
    );
  }
}

export const pageQuery = graphql`
  query SiteMetaDataQuery($path: String!) {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

// export const pageQuery = graphql`
//   query SiteMetadataLookup($slug: String!) {
//     site {
//       siteMetadata {
//         title
//       }
//     }
//   }
// `

// export const query = graphql`
//   query MyQuery {
//     file(
//       relativePath: {
//         eq: "./AgileAndLeanMentoringTile/AdobeStock_90682313-1024x683"
//       }
//     ) {
//       childImageSharp {
//         # Specify the image processing specifications right in the query.
//         # Makes it trivial to update as your page's design changes.
//         fluid(maxWidth: 700) {
//           ...GatsbyImageSharpFluid_noBase64
//         }
//       }
//     }
//   }
// `

Tile.propTypes = {
  title: PropTypes.string.isRequired,
  excerpt: PropTypes.oneOf([PropTypes.node, PropTypes.string]).isRequired,
  className: PropTypes.string,
  background: PropTypes.string.isRequired,
  icon: PropTypes.string,
  topic: PropTypes.string,
};

Tile.defaultProps = {
  className: '',
  icon: 'random',
  topic: '',
};

export default Tile;
