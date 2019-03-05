const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'iPad',
    },
  },
});
module.exports = capability;
