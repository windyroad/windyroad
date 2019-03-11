const defaults = require('./wdio.wip.conf.js').config;

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {});

localConfig.capabilities[0].chromeOptions.args = [
  '--headless',
  '--disable-gpu',
  '--window-size=1280,800',
];

localConfig.cucumberOpts.tagExpression = '';

exports.config = localConfig;
