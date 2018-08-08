import { faRandom } from '@fortawesome/free-solid-svg-icons';
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
    const duration = 1000;
    return (
      <article className={`${this.props.className} service-item`}>
        <Link
          to="contact"
          spy
          smooth
          hashSpy
          duration={duration}
          data-duration={duration}
          style={{ cursor: `pointer` }}
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
              <div className="special button cta">
                Find your {this.props.topic}{' '}
                <span style={{ whiteSpace: 'nowrap' }}>
                  navigator<FontAwesomeIcon
                    icon={faRandom}
                    size="1x"
                    style={{
                      verticalAlign: 'middle',
                      marginLeft: '0.5em',
                    }}
                  />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }
}

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
