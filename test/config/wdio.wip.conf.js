const defaults = require('./wdio.chrome.dev.conf.js').config
var querystring = require('querystring')

const defaultFeatures = require('../../src/features.js')

const localFeatures = Object.assign(defaultFeatures, {
  services: true,
})

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  features: localFeatures,
  beforeCommand: function(commandName, args) {
    if (commandName == 'url') {
      args[0] += '?' + querystring.stringify(localFeatures)
    }
  },
})
localConfig.cucumberOpts.tags = localConfig.getTags()

console.log('ops2', localConfig.capabilities[0].chromeOptions)

exports.config = localConfig
