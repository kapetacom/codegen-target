import * as YAML from 'yaml';
export default {
    process(sourceText, sourcePath, options) {
        return {
            code: `module.exports = ${JSON.stringify(YAML.parse(sourceText))};`,
        };
    },
};