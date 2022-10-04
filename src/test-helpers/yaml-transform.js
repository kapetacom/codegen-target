const YAML = require('yaml');
module.exports = {
    process(sourceText, sourcePath, options) {
        return {
            code: `module.exports = ${JSON.stringify(YAML.parse(sourceText))};`,
        };
    },
};