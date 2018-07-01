const capability = {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    args: ['--window-size=1280,800'],
  },
}

exports.config = capability
