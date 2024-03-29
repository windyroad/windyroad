const defaults = require('./wdio.saucelabs.conf').config;
const firefoxCapability = require('./capabilities/firefox.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [firefoxCapability],
});

exports.config = localConfig;
