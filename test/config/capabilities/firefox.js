const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  maxInstances: 5,
  browserName: 'firefox',
  marionette: false,
});

module.exports = capability;
