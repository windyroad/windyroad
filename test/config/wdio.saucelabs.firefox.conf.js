const defaults = require('./wdio.conf.js').config;
const firefoxCapability = require('./capabilities/firefox.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  maxInstances: 5,
  services: ['sauce'],
  capabilities: [firefoxCapability],
  user: process.env.SAUCE_LABS_USERNAME,
  key: process.env.SAUCE_LABS_KEY,
  sauceConnect: true,
});

exports.config = localConfig;
