const defaults = require('./wdio.saucelabs.conf').config;
const chromeCapability = require('./capabilities/chrome');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [chromeCapability],
});

exports.config = localConfig;
