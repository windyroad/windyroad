const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--window-size=1280,800']
      }
    }
  ],
  baseUrl: 'http://localhost:8000',
  path: '/',
  port: '9515',
  services: ['chromedriver']
})

localConfig.cucumberOpts.tags = '@wip'

exports.config = localConfig
