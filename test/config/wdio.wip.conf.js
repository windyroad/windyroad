const defaults = require('./wdio.chrome.dev.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  setFeatures: function() {
    global.features = { services: true }
  },
})

localConfig.cucumberOpts.tags = '@wip'

exports.config = localConfig
