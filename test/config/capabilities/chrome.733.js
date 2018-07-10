const chromeCapability = require('./chrome.js').config

const capability = Object.assign(chromeCapability, {})

capability.chromeOptions.args = ['--window-size=733,768']

exports.config = capability
