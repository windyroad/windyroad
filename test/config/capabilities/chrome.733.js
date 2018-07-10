//const chromeCapability = require('./chrome.js').config

const capability = {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--window-size=733,768'],
  },
}

exports.config = capability
