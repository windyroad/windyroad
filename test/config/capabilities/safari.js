const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  name: 'Windy Road Website - Safari',
  maxInstances: 5,
  browserName: 'safari',
});

module.exports = capability;
