const defaults = require('./wdio.chrome.conf.js').config;
const chrome733Capability = require('./capabilities/chrome.733.js');

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [chrome733Capability],
});

exports.config = localConfig;
