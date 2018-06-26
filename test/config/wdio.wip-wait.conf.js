const defaults = require('./wdio.wip.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  after: () => {
    browser.debug()
  }
})

exports.config = localConfig