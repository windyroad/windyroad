const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [
    {
      browserName: 'safari',
    },
  ],
  services: ['selenium-standalone'],
})

exports.config = localConfig
