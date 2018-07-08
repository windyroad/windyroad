import PropTypes from 'prop-types' // eslint-disable-line import/no-extraneous-dependencies
import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import GotoNext from '../GotoNext'

class Services extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.id
  }

  static get propTypes() {
    return {
      id: PropTypes.string.isRequired,
      nextActive: PropTypes.func.isRequired,
      nextInactive: PropTypes.func.isRequired,
      next: PropTypes.string.isRequired,
    }
  }

  handleSetActive() {}

  handleSetInactive() {}

  render() {
    return (
      <section
        className="page-wrapper bot0 spotlightx backdropped"
        {...this.props}
      >
        <div className="content">Services</div>
        <GotoNext
          to={this.props.next}
          onSetActive={this.props.nextActive}
          onSetInactive={this.props.nextInactive}
        />
      </section>
    )
  }
}

export default Services
