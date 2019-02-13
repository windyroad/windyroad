const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
  },
});

module.exports = capability;
