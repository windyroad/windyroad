const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome Landscape',
  chromeOptions: {
    args: ['--window-size=667,425'],
  },
});

module.exports = capability;
