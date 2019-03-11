const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome iPad Pro',
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'iPad Pro',
    },
  },
});

module.exports = capability;
