import React from 'react'
import Link from 'gatsby-link'
import './index.css'
import FontAwesome from 'react-fontawesome'
import Button from '../Button'

export default props => (
  <Button
    style={{
      fontWeight: '900',
      verticalAlign: 'middle',
    }}
  >
    Find your navigator{' '}
    <FontAwesome
      name="random"
      style={{
        verticalAlign: 'middle',
      }}
    />
  </Button>
)
