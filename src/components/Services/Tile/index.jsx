import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import './index.css'

class Tile extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {}

  componentWillUnmount() {}

  static get propTypes() {
    return {
      title: PropTypes.string.isRequired,
      excerpt: PropTypes.oneOf([PropTypes.node, PropTypes.string]).isRequired,
      className: PropTypes.sting,
    }
  }

  static get defaultProps() {
    return {
      className: '',
    }
  }

  render() {
    return (
      <article className={this.props.className}>
        <header>
          <h3>{this.props.title}</h3>
        </header>
        <div className="excerpt">{this.props.excerpt}</div>
      </article>
    )
  }
}

export default Tile
