const defaults = require('./wdio.chrome.dev.conf.js').config
var querystring = require('querystring')

const defaultFeatures = require('../../src/features.js')

const wipFeatures = {
  services: true,
}

const localFeatures = Object.assign(defaultFeatures, wipFeatures)

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  features: localFeatures,
  beforeCommand: function(commandName, args) {
    if (commandName == 'url') {
      args[0] += '?' + querystring.stringify(wipFeatures)
    }
  },
})
localConfig.cucumberOpts.tags = localConfig.getTags()

exports.config = localConfig
