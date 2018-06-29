const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [
    {
      maxInstances: 5,
      browserName: 'chrome',
      chromeOptions: {
        args: ['--window-size=667,375'],
      },
    },
  ],
  path: '/',
  port: '9515',
  services: ['chromedriver'],
})

exports.config = localConfig
