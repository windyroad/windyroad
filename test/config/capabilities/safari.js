const baseCapability = require('./base-capability');

const capability = Object.assign({}, baseCapability, {
  maxInstances: 5,
  browserName: 'safari',
});

module.exports = capability;
