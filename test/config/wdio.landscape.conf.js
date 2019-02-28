const defaults = require('./wdio.chrome.conf.js').config;
const landscapeCapability = require('./capabilities/landscape.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [landscapeCapability],
});

exports.config = localConfig;
