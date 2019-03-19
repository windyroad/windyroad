const defaults = require('./wdio.safari.conf.js').config;

// clone prod config and add new properties/overrides
const localConfig = Object.assign(defaults, {
  after: () => {
    //browser.debug();
  },
});
localConfig.cucumberOpts.tagExpression =
  localConfig.cucumberOpts.tagExpression + ' and @wip';

exports.config = localConfig;
