const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome iPad',
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'iPad',
    },
  },
});
module.exports = capability;
