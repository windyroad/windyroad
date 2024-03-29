const waitPort = require('wait-port');
const extractTarget = require('wait-port/lib/extract-target');

const chromeCapability = require('./capabilities/chrome.js');
const landscapeCapability = require('./capabilities/landscape.js');
const pixel2Capability = require('./capabilities/pixel2.js');
const chrome733Capability = require('./capabilities/chrome.733.js');
const chromeIPadCapability = require('./capabilities/chrome.iPad.js');
const chromeIPadProCapability = require('./capabilities/chrome.iPadPro.js');

// NOTE: Not testing in safari because webdirver.io scroll is borken 😢
//const safariCapability = require('./capabilities/safari.js');

const defaultFeatures = require('../../src/features.js');

let config = {
  //
  // ================== Specify Test Files ================== Define which test
  // specs should run. The pattern is relative to the directory from which `wdio`
  // was called. Notice that, if you are calling `wdio` from an NPM script (see
  // https://docs.npmjs.com/cli/run-script) then the current working directory is
  // where your package.json resides, so `wdio` will be called from there.
  //
  specs: ['./test/features/**/*.feature'],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  //
  // ============ Capabilities ============ Define your capabilities here.
  // WebdriverIO can run multiple capabilities at the same time. Depending on the
  // number of capabilities, WebdriverIO launches several test sessions. Within
  // your capabilities you can overwrite the spec and exclude options in order to
  // group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time.
  // Let's say you have 3 different capabilities (Chrome, Firefox, and Safari) and
  // you have set maxInstances to 1; wdio will spawn 3 processes. Therefore, if
  // you have 10 spec files and you set maxInstances to 10, all spec files will
  // get tested at the same time and 30 processes will get spawned. The property
  // handles how many capabilities from the same test should run tests.
  //
  maxInstances: 5,
  //
  // If you have trouble getting all important capabilities together, check out
  // the Sauce Labs platform configurator - a great tool to configure your
  // capabilities: https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [
    chromeCapability,
    landscapeCapability,
    pixel2Capability,
    chrome733Capability,
    chromeIPadCapability,
    chromeIPadProCapability,
    // safariCapability,
  ],
  //
  // =================== Test Configurations =================== Define all
  // options that are relevant for the WebdriverIO instance here
  //
  // By default WebdriverIO commands are executed in a synchronous way using the
  // wdio-sync package. If you still want to run your tests in an async way e.g.
  // using promises you can set the sync option to false.
  sync: true,
  //
  // Level of logging verbosity: silent | verbose | command | data | result |
  // error
  logLevel: 'verbose',
  //
  // Enables colors for log output.
  coloredLogs: true,
  //
  // Warns when a deprecated command is used
  deprecationWarnings: true,
  //
  // If you only want to run your tests until a specific amount of tests have
  // failed use bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Saves a screenshot to a given path if a command fails.
  screenshotPath: './target/errorShots/',
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter
  // starts with `/`, the base url gets prepended, not including the path portion
  // of your baseUrl. If your `url` parameter starts without a scheme or `/`
  // (like `some/path`), the base url gets prepended directly.
  baseUrl: 'http://localhost:9000',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 20000,
  //
  // Default timeout in milliseconds for request if Selenium Grid doesn't send
  // response
  connectionRetryTimeout: 90000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should
  // have the plugin name as key and the desired plugin options as properties.
  // Make sure you have the plugin installed before running any tests. The
  // following plugins are currently available: WebdriverCSS:
  // https://github.com/webdriverio/webdrivercss WebdriverRTC:
  // https://github.com/webdriverio/webdriverrtc Browserevent:
  // https://github.com/webdriverio/browserevent plugins: {     webdrivercss: {
  // screenshotRoot: 'my-shots',         failedComparisonsRoot: 'diffs',
  // misMatchTolerance: 0.05,         screenWidth: [320,480,640,1024]     },
  // webdriverrtc: {},     browserevent: {} },
  //
  // Test runner services Services take over a specific job you don't want to take
  // care of. They enhance your test setup with almost no effort. Unlike plugins,
  // they don't add new commands. Instead, they hook themselves up into the test
  // process.
  services: ['selenium-standalone'],

  //
  // Framework you want to run your specs with. The following are supported:
  // Mocha, Jasmine, and Cucumber see also:
  // http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework
  // installed before running any tests.
  framework: 'cucumber',
  //
  // Test reporter for stdout. The only one supported by default is 'dot' see
  // also: http://webdriver.io/guide/reporters/dot.html
  reporters: ['spec', 'dot', 'junit', 'cucumber-snippet'],

  reporterOptions: {
    junit: {
      outputDir: './target/reports/junit',
    },
    json: {
      outputDir: './target/reports/json',
    },
    allure: {
      outputDir: './target/reports/allure',
    },
  },

  //
  // If you are using Cucumber you need to specify the location of your step
  // definitions.
  cucumberOpts: {
    require: [
      './test/steps/given.js',
      './test/steps/then.js',
      './test/steps/when.js',
      './test/steps/steps.js',
    ], // <string[]> (file/dir) require files before executing features
    backtrace: false, // <boolean> show full backtrace for errors
    compiler: ['js:@babel/register'], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    dryRun: false, // <boolean> invoke formatters without executing steps
    failFast: false, // <boolean> abort the run on first failure
    format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    colors: true, // <boolean> disable colors in formatter output
    snippets: true, // <boolean> hide step definition snippets for pending steps
    source: true, // <boolean> hide source uris
    profile: [], // <string[]> (name) specify the profile to use
    strict: false, // <boolean> fail if there are any undefined or pending steps
    tagExpression: '', // <string[]> (expression) only execute the features or scenarios with tags matching the expression
    timeout: 40000, // <number> timeout for step definitions
    ignoreUndefinedDefinitions: true, // <boolean> Enable this config to treat undefined definitions as warnings.
  },

  //
  // ===== Hooks ===== WebdriverIO provides several hooks you can use to interfere
  // with the test process in order to enhance it and to build services around
  // it. You can either apply a single function or an array of methods to it. If
  // one of them returns with a promise, WebdriverIO will wait until that promise
  // got resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function(config) {
    //, capabilities) {
    console.log('TAG Expression:', config.cucumberOpts.tagExpression);
    // process.exit();
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // beforeSession: function(config, capabilities, specs) {
  // },
  features: defaultFeatures,
  getTags: function() {
    const keys = Object.keys(this.features);
    let enabled = keys
      .map(key => {
        if (this.features[key]) {
          return `@${key}`;
        } else {
          return `@not-${key}`;
        }
      })
      .join(' or ');

    // not(a) and not(b)
    // not(a or b)

    let disabled = keys
      .map(key => {
        if (this.features[key]) {
          return `@not-${key}`;
        } else {
          return `@${key}`;
        }
      })
      .join(' or ');
    let tags = `(${enabled}) and not(${disabled})`;
    console.log('TAGS Expression:', tags);
    return tags;
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: async function before(/*capabilities*/) {
    /**
     * Setup the Chai assertion framework
     */
    require('@babel/register');
    const chai = require('chai');

    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should();

    const target = extractTarget(this.baseUrl);
    try {
      const open = await waitPort(target);

      if (open) {
        console.log('The port is now open!');
      } else {
        console.error('The port did not open before the timeout...');
        process.abort();
      }
    } catch (err) {
      console.error(
        `An unknown error occured while waiting for the port: ${err}`,
      );
      process.abort();
    }
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) { },

  /**
   * Runs before a Cucumber feature
   * @param {Object} feature feature details
   */
  // beforeFeature: function (feature) { },
  /**
   * Runs before a Cucumber scenario
   * @param {Object} scenario scenario details
   */
  // beforeScenario: function (scenario) { },
  /**
   * Runs before a Cucumber step
   * @param {Object} step step details
   */
  // beforeStep: function (step) { },
  /**
   * Runs after a Cucumber step
   * @param {Object} stepResult step result
   */
  // afterStep: function (stepResult) { },
  /**
   * Runs after a Cucumber scenario
   * @param {Object} scenario scenario details
   */
  // afterScenario: function (scenario) { },
  /**
   * Runs after a Cucumber feature
   * @param {Object} feature feature details
   */
  // afterFeature: function (feature) { },

  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: (/*commandName, args, result, error*/) => {
    browser.execute(`window.features = ${JSON.stringify(global.features)}`); // eslint-disable-line no-undef
    browser.execute(`console.log('features:', window.features)`); // eslint-disable-line no-undef

    // const logs = browser.log('browser')
    // console.log('BROWSER LOGS:')
    // for (let i = 0; i < logs.value.length; i += 1) {
    //   console.log('\t>>', logs.value[i].message)
    // }
    // console.log('END BROWSER LOGS')
  },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: (/*result, capabilities, specs*/) => {
    // browser.debug()
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) { },
  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  //  onComplete: function(exitCode, config, capabilities) {  }
};

config.cucumberOpts.tagExpression = config.getTags();

exports.config = config;
