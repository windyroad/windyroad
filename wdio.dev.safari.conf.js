const defaults = require("./wdio.conf.js").config;

// clone prod config and add new properties/overrides
var localConfig = Object.assign(defaults, {
    capabilities: [{
         browserName: 'chrome'
    }],
    baseUrl: 'http://localhost:8000',
    path: '/',
    port: '9515',
    services: ['chromedriver'],
});

// delete any unwanted properties
// delete localConfig.user;
// delete localConfig.key;
// delete localConfig.sauceConnect;

exports.config = localConfig;
