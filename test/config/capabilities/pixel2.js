const capability = {
  maxInstances: 5,
  browserName: 'chrome',
  chromeOptions: {
    mobileEmulation: {
      deviceName: 'Pixel 2',
    },
  },
}

exports.config = capability
