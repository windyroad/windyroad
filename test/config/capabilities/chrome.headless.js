const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  chromeOptions: {
    args: ['--headless', '--disable-gpu', '--window-size=1280,800'],
  },
});

module.exports = capability;
