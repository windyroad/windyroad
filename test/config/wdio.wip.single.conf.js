const defaults = require('./wdio.wip.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {})
localConfig.cucumberOpts.tags = localConfig.cucumberOpts.tags + ' and @wip'

console.log('ops1', localConfig.capabilities[0].chromeOptions)

exports.config = localConfig
