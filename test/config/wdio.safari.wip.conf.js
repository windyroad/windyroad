const defaults = require('./wdio.safari.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  baseUrl: 'http://localhost:8000',
})

localConfig.cucumberOpts.tags = '@wip'

exports.config = localConfig
