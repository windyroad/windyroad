const baseCapability = require('./base-capability');

const capability = Object.assign(baseCapability, {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--window-size=1280,800'],
  },
});

exports.config = capability;
