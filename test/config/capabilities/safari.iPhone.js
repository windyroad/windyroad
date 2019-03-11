const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Safari iPhone',
  maxInstances: 1,
  browserType: 'iphone',
  deviceName: 'iPhone Simulator',
  deviceOrientation: 'portrait',
  platformVersion: '10.0',
  platformName: 'iOS',
  browserName: 'Safari',

  // app: 'net.company.SafariLauncher', // bundle id of the app or safari launcher
  // udid: '123123123123abc',
});

module.exports = capability;
