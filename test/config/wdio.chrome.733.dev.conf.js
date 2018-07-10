const defaults = require('./wdio.chrome.733.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  baseUrl: 'http://localhost:8000',
})

exports.config = localConfig
