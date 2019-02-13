const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--window-size=667,425'],
  },
});

module.exports = capability;
