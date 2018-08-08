const defaults = require('./wdio.conf.js').config;
const firefoxCapability = require('./capabilities/firefox.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [firefoxCapability],
  services: ['selenium-standalone'],
});

exports.config = localConfig;
