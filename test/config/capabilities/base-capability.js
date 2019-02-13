const envKeys = Object.keys(process.env);
const CIRCLE_ENV = {};
for (let i = 0; i < envKeys.length; i++) {
  const key = envKeys[i];
  if (key.startsWith('CIRCLE') && key !== 'CIRCLE_TOKEN') {
    CIRCLE_ENV[key] = process.env[key];
  }
}

const capability = {
  name: 'Windy Road Website',
  build: `build-${
    process.env.CIRCLE_BUILD_NUM ? process.env.CIRCLE_BUILD_NUM : 'LOCAL'
  }`,
  'custom-data': CIRCLE_ENV,
  tags: ['windyroad.com.au'],
};

module.exports = capability;
