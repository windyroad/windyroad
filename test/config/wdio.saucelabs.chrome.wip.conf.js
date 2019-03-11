const defaults = require('./wdio.saucelabs.chrome.conf').config;

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {});
localConfig.cucumberOpts.tagExpression =
  localConfig.cucumberOpts.tagExpression + ' and @wip';

exports.config = localConfig;
