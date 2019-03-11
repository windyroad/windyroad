const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome 1280',
  chromeOptions: {
    args: ['--window-size=1280,800'],
  },
});

module.exports = capability;
