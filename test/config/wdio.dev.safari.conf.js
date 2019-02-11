const defaults = require('./wdio.conf.js').config;
const safariCapability = require('./capabilities/safari.js').config;

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  capabilities: [safariCapability],
  baseUrl: 'http://localhost:8000',
  services: ['selenium-standalone'],
});

// delete any unwanted properties delete localConfig.user; delete
// localConfig.key; delete localConfig.sauceConnect;

exports.config = localConfig;
