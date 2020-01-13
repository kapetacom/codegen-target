const _ = require('lodash');
const Path = require('path');
const FS = require('fs');
const Template = require('./Template');
const CodeFormatter = require('./CodeFormatter');

function walkDirectory(dir) {
    let results = [];

    var files = FS.readdirSync(dir);

    files.forEach((file) => {
        file = Path.resolve(dir, file);
        const stat = FS.statSync(file);
        if (stat && stat.isDirectory()) {
            const subResults = walkDirectory(file);
            results = results.concat(subResults);
        } else {
            results.push(file);
        }
    });

    return results;
}

class Target {
    /**
     *
     * @param {object} options
     * @param {string} baseDir
     * @param {CodeFormatter} [formatter]
     */
    constructor(options, baseDir, formatter) {
        /**
         * @type {object}
         * @property
         * @public
         */
        this.options = options;

        /**
         * @type {string}
         * @property
         * @private
         */

        this._baseDir = baseDir;

        /**
         * @type {CodeFormatter}
         * @property
         * @protected
         */
        this._formatter = formatter || new CodeFormatter();
    }

    /**
     *
     * @param {object} data
     * @returns {Template}
     * @protected
     */
    _createTemplateEngine(data) {
        return Template.create(data, this._formatter);
    }

    /**
     * The actual rendering of code - uses handlebars by default
     *
     * Override this method to change templating engine
     *
     * @param {Template} templateEngine The template engine
     * @param {string} sourceFile The template file name
     * @param {string} templateSource The template file content
     * @param {object} data The data from the YML definition
     * @param {object} context The full YML document
     * @returns {string} the rendered code
     * @protected
     */
    _render(templateEngine, sourceFile, templateSource, data, context) {
        try {
            const template = templateEngine.compile(templateSource);

            return template({
                options: this.options,
                data,
                context
            });
        } catch(e) {
            throw new Error('Failed to compile source:' + sourceFile + '. ' + e.stack);
        }
    }

    /**
     * Called for all code that has been generated
     *
     * Override to do post processing of the generated code - e.g. use "prettier" to format it
     *
     * @param {string} filename the relative filename of the source file
     * @param {string} code the actual rendered code
     * @returns {string}
     * @protected
     */
    _postProcessCode(filename, code) {
        return code;
    }

    /**
     * Generates 1 or more source code files given a blob of data with a "kind" property
     *
     * Throws if the kind is unknown or template is not found.
     *
     * Note that this method returns the generated code as an array of data - and
     * does not write anything to disk.
     *
     * @param {object} data
     * @param {object} context
     * @returns {{filename: string, content: string}[]}
     */
    generate(data, context) {

        const template = data.kind.toLowerCase();

        if (!template) {
            throw new Error('No template found for kind: ' + data.kind);
        }

        var templateDir = Path.join(this._baseDir, 'templates', template);

        if (!FS.existsSync(templateDir)) {
            throw new Error('Template not found "' + templateDir + '" for kind: ' + data.kind);
        }

        const templateFiles = walkDirectory(templateDir);

        const templateEngine = this._createTemplateEngine(data, context);

        return templateFiles.map((fileName) => {
            const templateSource = FS.readFileSync(fileName).toString();

            //We always clone data in case a target implementation wants to change it
            const sourceCode = this._render(templateEngine, fileName, templateSource, _.cloneDeep(data), context);

            const filename = fileName.substr(templateDir.length + 1);

            return this._parseCode(filename, sourceCode);
        });
    }

    _parseCode(filename, sourceCode) {
        let mode = 'write-always';
        let permissions = '644';
        const lines = sourceCode.split(/\n/g).filter((line) => {
            if (line.indexOf('#FILENAME:') > -1) {
                filename = line.split(/#FILENAME:/)[1];
                if (filename.indexOf(':') > -1) {
                    [filename, mode, permissions] = filename.split(/:/g);
                }

                if (!permissions) {
                    permissions = '644';
                }

                if (!mode) {
                    mode = 'write-always';
                }

                return false;
            }

            return true;
        });

        return {
            filename: filename,
            content: this._postProcessCode(filename, lines.join('\n')),
            mode,
            permissions
        };
    }

}


module.exports = Target;