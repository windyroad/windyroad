const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome Pixel 2',
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'Pixel 2',
    },
  },
});

module.exports = capability;
