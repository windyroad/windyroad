const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Firefox',
  maxInstances: 5,
  browserName: 'firefox',
  marionette: false,
});

module.exports = capability;
