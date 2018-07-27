import React from 'react' // eslint-disable-line import/no-extraneous-dependencies
import { faVial } from '@fortawesome/free-solid-svg-icons'
import Tile from '..'
import './index.css'
import background from './AdobeStock_95141032-1024x683.jpg'

const TestAutomationTile = function() {
  return (
    <Tile
      title="BDD &amp; Test Automation Service"
      className="test-automation"
      excerpt="Get so much more from your test automation efforts."
      background={background}
      icon={faVial}
      topic="test automation"
    />
  )
}

export default TestAutomationTile
