const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'iPad Pro',
    },
  },
});

module.exports = capability;
