const defaults = require('./wdio.conf.js').config
const chromeCapability = require('./capabilities/chrome.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [chromeCapability],
  path: '/',
  port: '9515',
  services: ['chromedriver'],
})

exports.config = localConfig
