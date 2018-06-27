const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  maxInstances: 5,
  services: ['sauce'],
  user: process.env.SAUCE_LABS_USERNAME,
  key: process.env.SAUCE_LABS_KEY,
  sauceConnect: true,
})

exports.config = localConfig
