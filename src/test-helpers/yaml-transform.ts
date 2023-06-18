import * as YAML from 'yaml';

module.exports = {
    process(sourceText:string, sourcePath:string, options:any) {
        return {
            code: `module.exports = ${JSON.stringify(YAML.parse(sourceText))};`,
        };
    },
};
