const capability = {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--window-size=667,425'],
  },
}

exports.config = capability
