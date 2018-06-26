const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [
    {
      maxInstances: 5,
      browserName: 'chrome',
      chromeOptions: {
        args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
      },
    },
  ],
  path: '/',
  port: '9515',
  services: ['chromedriver'],
})

localConfig.cucumberOpts.tags = []
// delete any unwanted properties delete localConfig.user; delete
// localConfig.key; delete localConfig.sauceConnect;

exports.config = localConfig
