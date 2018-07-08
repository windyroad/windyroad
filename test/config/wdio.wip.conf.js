const defaults = require('./wdio.chrome.dev.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {})

localConfig.cucumberOpts.tags = '@wip'

exports.config = localConfig
