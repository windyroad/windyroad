// adapted from `front-matter` module
const yamlParser = require('js-yaml')

// extract /* @meta [YAML] */ comments
module.exports = function parse(string) {
	const match = /\/\*\s*@meta([\s\S]*?)\*\//.exec(string)

	if (!match) {
		return {
			attributes: {},
			body: string,
		}
	}

	const yaml = match[1].trim()
	const attributes = yamlParser.load(yaml) || {}
	const body = string.substr(match[0].length)
	return {attributes, body, frontmatter: yaml}
}