const defaults = require('./wdio.conf.js').config;
const chromeHeadlessCapability = require('./capabilities/chrome.headless');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [chromeHeadlessCapability],
  path: '/',
  port: '9515',
  services: ['chromedriver'],
});

//localConfig.cucumberOptstagExpression = ''
// delete any unwanted properties delete localConfig.user; delete
// localConfig.key; delete localConfig.sauceConnect;

exports.config = localConfig;
