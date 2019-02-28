const defaults = require('./wdio.chrome.conf.js').config;
const pixel2Capability = require('./capabilities/pixel2.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [pixel2Capability],
});

exports.config = localConfig;
