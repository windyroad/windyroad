const defaults = require('./wdio.saucelabs.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  baseUrl: 'https://stg.windyroad.org',
  sauceConnect: false,
  before: async function before() {
    /**
     * Setup the Chai assertion framework
     */
    const chai = require('chai')

    global.expect = chai.expect
    global.assert = chai.assert
    global.should = chai.should()
  },
})

exports.config = localConfig
