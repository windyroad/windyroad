const axios = require('axios').create({
    baseURL: 'https://api.github.com',
    headers: {
        'authorization': `token ${process.env.GITHUB_TOKEN}`
    }
})
const FormData = require('form-data');
const fs = require('fs');
const urlTemplate = require('url-template');
const path = require('path');

async function getReleases(owner, repo) {
    try {
        let response = await axios.get(`/repos/${owner}/${repo}/releases`);
        return response.data;
    } catch (err) {
        throw new Error(err);
    }
}

async function cretePreRelease(owner, repo, file) {
    try {
        let releases = await getReleases(owner, repo);
        let nextVersion = '1.0.0'
        if (releases.length != 0) {
            let currentVersion = releases[0].tag_name;
            let [major,
                minor,
                point] = currentVersion.split('.');
            console.log("prev prerelease?", releases[0].prerelease)
            if (releases[0].prerelease) {
                ++minor;
            } else {
                ++major;
            }
            nextVersion = `${major}.${minor}.${point}`;
        }
        let createResponse = await axios.post(`/repos/${owner}/${repo}/releases`, {
            "tag_name": nextVersion,
            "name": `v${nextVersion}`,
            "body": `v${nextVersion}`,
            "draft": process.env.CI == null,
            "prerelease": true
        });
        console.log(createResponse.data);
        let uploadUrl = urlTemplate
            .parse(createResponse.data.upload_url)
            .expand({'name': path.basename(file), 'label': '' });
        let formData = new FormData();
        fs.readFile(file, async(err, data) => {
            try {
                if (err) 
                    throw err;
                formData.append('file', data);
                let uploadResponse = await axios.post(uploadUrl, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log(uploadResponse);
            } catch (err) {
                console.error(err);
                throw new Error(err);
            }
        });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    cretePreRelease: cretePreRelease
};