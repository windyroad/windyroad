const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome 733',
  chromeOptions: {
    args: ['--window-size=733,768'],
  },
});

module.exports = capability;
