import PropTypes from 'prop-types'; // eslint-disable-line import/no-extraneous-dependencies
import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleDown } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-scroll';
import './index.css';

class GotoNext extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      click: false,
    };

    this.clickStart = this.clickStart.bind(this);
    this.clickEnd = this.clickEnd.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  static get propTypes() {
    return {
      to: PropTypes.string.isRequired,
      onSetActive: PropTypes.func.isRequired,
      onSetInactive: PropTypes.func.isRequired,
    };
  }

  clickStart() {
    this.setState({ click: true });
    return true;
  }

  clickEnd() {
    this.setState({ click: false });
    return true;
  }

  render() {
    const scrollDuration = 1000;
    return (
      <Link
        className={`goto-next ${this.state.click ? ' click' : ''}`}
        to={this.props.to}
        spy
        smooth
        hashSpy
        duration={scrollDuration}
        onSetActive={this.props.onSetActive}
        onSetInactive={this.props.onSetInactive}
        data-duration={scrollDuration}
        // onMouseDown={this.clickStart}
        onTouchStart={this.clickStart}
        // onMouseUp={this.clickEnd}
        onTouchEnd={this.clickEnd}
        // onClick={() => {
        //   console.log('clicked')
        // }}
      >
        <FontAwesomeIcon icon={faArrowAltCircleDown} />
      </Link>
    );
  }
}

export default GotoNext;
