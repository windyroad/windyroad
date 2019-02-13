const defaults = require('./wdio.saucelabs.conf').config;
const safariCapability = require('./capabilities/safari');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [safariCapability],
});

exports.config = localConfig;
