const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Chrome Headless',
  chromeOptions: {
    args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
  },
});

module.exports = capability;
