const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'iPad',
    },
  },
});
module.exports = capability;
