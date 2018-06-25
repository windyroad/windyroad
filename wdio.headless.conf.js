const defaults = require('./wdio.conf.js').config

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--window-size=1280,800', '--disable-gpu', '--headless'],
      },
    },
  ],
  path: '/',
  port: '9515',
  services: ['chromedriver'],
})

// delete any unwanted properties delete localConfig.user; delete
// localConfig.key; delete localConfig.sauceConnect;

exports.config = localConfig