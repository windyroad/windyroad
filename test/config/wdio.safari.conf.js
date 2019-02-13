const defaults = require('./wdio.conf.js').config;
const safariCapability = require('./capabilities/safari.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [safariCapability],
  services: ['selenium-standalone'],
});

exports.config = localConfig;
