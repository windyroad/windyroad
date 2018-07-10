const defaults = require('./wdio.chrome.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  baseUrl: 'http://localhost:8000',
})

console.log('ops3', localConfig.capabilities[0].chromeOptions)

exports.config = localConfig
