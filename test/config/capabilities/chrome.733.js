const baseCapability = require('./base-chrome');

const capability = Object.assign({}, baseCapability, {
  chromeOptions: {
    args: ['--window-size=733,768'],
  },
});

module.exports = capability;
