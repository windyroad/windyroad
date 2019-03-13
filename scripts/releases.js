const got = require('got');
const Keyv = require('keyv');
const KeyvFile = require('keyv-file');

const cacheFile = new Keyv({
  store: new KeyvFile({
    filename: `./target/keyv-release.json`, // the file path to store the data
    expiredCheckDelay: 24 * 3600 * 1000, // ms, check and remove expired data in each ms
    writeDelay: 0, // ms, batch write to disk in a specific duration, enhance write performance.
  }),
});

const gotOptions = {
  baseUrl: 'https://api.github.com',
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'tompahoward',
  },
  resolveWithFullResponse: true,
  json: true,
  cache: cacheFile,
};

const FormData = require('form-data');
const fs = require('fs');
const urlTemplate = require('url-template');
const path = require('path');

async function getReleases(owner, repo) {
  try {
    let response = await got(`/repos/${owner}/${repo}/releases`, gotOptions);
    return response.body;
  } catch (err) {
    throw new Error(err);
  }
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

async function cretePreRelease(
  owner,
  repo,
  artifactFile,
  outputVersionFile,
  outputArtifactUrl,
) {
  try {
    let releases = await getReleases(owner, repo);
    let nextVersion = '1.0.0';
    if (releases.length != 0) {
      let currentVersion = releases[0].tag_name;
      let [major, minor, point] = currentVersion.split('.');
      console.log('prev prerelease?', releases[0].prerelease);
      if (releases[0].prerelease) {
        ++minor;
      } else {
        ++major;
      }
      nextVersion = `${major}.${minor}.${point}`;
    }
    console.log('next version', nextVersion);
    fs.writeFileSync(outputVersionFile, nextVersion);
    let createResponse = await got.post(
      `/repos/${owner}/${repo}/releases`,
      Object.assign({}, gotOptions, {
        body: {
          tag_name: nextVersion,
          name: `v${nextVersion}`,
          body: `v${nextVersion}`,
          draft: process.env.CI == null,
          prerelease: true,
        },
      }),
    );
    console.log(createResponse.body);
    let uploadUrl = urlTemplate
      .parse(createResponse.body.upload_url)
      .expand({ name: path.basename(artifactFile), label: '' });

    var stats = fs.statSync(artifactFile);

    await fs
      .createReadStream(artifactFile)
      .pipe(
        got.stream.post(
          uploadUrl,
          Object.assign({}, gotOptions, {
            json: false,
            headers: Object.assign({}, gotOptions.headers, {
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/gzip',
              'Content-Length': stats.size,
            }),
          }),
        ),
      )
      .on('response', async response => {
        const unparsedBody = await streamToString(response);
        const uploadResponseBody = JSON.parse(unparsedBody);
        console.log('upload response body', uploadResponseBody);
        fs.writeFileSync(outputArtifactUrl, uploadResponseBody.url);
        console.log('DONE');
      })
      .on('uploadProgress', progress => {
        console.log('progress', progress);
      })
      .on('error', (error, body, response) => {
        console.error(error);
        process.exit(1);
      });

    // let form = new FormData();

    // form.append('file', fs.createReadStream(artifactFile));

    // const uploadResponse = await got.post(
    //   uploadUrl,
    //   Object.assign({}, gotOptions, {
    //     body: form,
    //     json: false,
    //   }),
    // );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

module.exports = {
  cretePreRelease: cretePreRelease,
};
