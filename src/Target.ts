import * as _ from 'lodash';
import * as Path from 'path';
import * as FS from 'fs';
import * as Template from './Template';
import {CodeFormatter} from './CodeFormatter';
import {GeneratedFile} from "./types";

function walkDirectory(dir:string) {
    let results:string[] = [];

    const files = FS.readdirSync(dir);

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

/**
 * Target is the base class of all code generation language targets.
 * Extend this to implement a new language target.
 *
 */
export class Target {
    protected readonly options: object;
    private readonly _baseDir: string;
    private readonly _formatter: CodeFormatter;
    /**
     *
     * @param {object} options Options to pass on all templates during rendering.
     * @param {string} baseDir The basedir of the templates belonging to this target. It expects a "templates" folder at this base dir.
     * @param {CodeFormatter} [formatter] The code formatter to use for this target.
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

    protected _createTemplateEngine(data:any, context): typeof Handlebars {
        return Template.create(data, context, this._formatter);
    }

    /**
     * The actual rendering of code - uses handlebars by default
     *
     * Override this method to change templating engine
     */
    protected _render(templateEngine: typeof Handlebars, sourceFile: string, templateSource: string, data: any, context: any):string {
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
     */
    protected _postProcessCode(filename:string, code:string):string {
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
     */
    public generate(data:any, context:any):GeneratedFile[] {

        const [template, version] = data.kind.toLowerCase().split(':');

        if (!template) {
            throw new Error('No template found for kind: ' + data.kind);
        }

        const rootTemplateDir = Path.join(this._baseDir, 'templates');
        const kindTemplateDir = Path.join(rootTemplateDir, template);

        if (!FS.existsSync(kindTemplateDir)) {
            throw new Error('Template not found "' + kindTemplateDir + '" for kind: ' + data.kind);
        }

        const templateFiles = walkDirectory(kindTemplateDir);

        const templateEngine = this._createTemplateEngine(data, context);

        walkDirectory(rootTemplateDir).map(file => {
            return {id: file.substring(rootTemplateDir.length + 1), file}
        }).forEach(info => {
            const content = FS.readFileSync(info.file).toString();
            templateEngine.registerPartial(info.id, content);
        });

        const out:GeneratedFile[] = [];

        templateFiles.forEach((fileName) => {
            const templateSource = FS.readFileSync(fileName).toString();

            //We always clone data in case a target implementation wants to change it
            const sourceCode = this._render(templateEngine, fileName, templateSource, _.cloneDeep(data), context);

            const filename = fileName.substr(kindTemplateDir.length + 1);

            const file = this._parseCode(filename, sourceCode);
            if (file) {
                out.push(file);
            }
        });

        return out;
    }

    public async preprocess(data) {
        return data;
    }

    private _parseCode(filename, sourceCode):null|GeneratedFile {
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

        if (mode === 'skip') {
            return null;
        }


        return {
            filename: filename,
            content: this._postProcessCode(filename, lines.join('\n')),
            mode,
            permissions
        };
    }

}