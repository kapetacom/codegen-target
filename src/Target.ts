/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import * as _ from 'lodash';
import * as Path from 'path';
import * as FS from 'fs';
import * as Template from './Template';
import { CodeFormatter } from './CodeFormatter';
import { GeneratedAsset, GeneratedFile, SourceFile } from './types';
import { parseKapetaUri } from '@kapeta/nodejs-utils';

function walkDirectory(dir: string) {
    let results: string[] = [];

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

    constructor(options: object, baseDir: string, formatter?: CodeFormatter) {
        this.options = options;
        this._baseDir = baseDir;
        this._formatter = formatter || new CodeFormatter();
    }

    protected _createTemplateEngine(data: any, context: any): Template.TemplateType {
        return Template.create(data, context, this._formatter);
    }

    /**
     * The actual rendering of code - uses handlebars by default
     *
     * Override this method to change templating engine
     */
    protected _render(
        templateEngine: typeof Handlebars,
        sourceFile: string,
        templateSource: string,
        data: any,
        context: any
    ): string {
        try {
            const template = templateEngine.compile(templateSource);

            return template({
                options: this.options,
                data,
                context,
            });
        } catch (e: any) {
            throw new Error('Failed to compile source:' + sourceFile + '. ' + e.stack);
        }
    }

    /**
     * Called for all code that has been generated
     *
     * Override to do post processing of the generated code - e.g. use "prettier" to format it
     *
     */
    protected _postProcessCode(filename: string, code: string): string {
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
    public generate(data: any, context: any): GeneratedFile[] {
        const kindUri = parseKapetaUri(data.kind);
        const template = kindUri.fullName;

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

        walkDirectory(rootTemplateDir)
            .map((file) => {
                return { id: file.substring(rootTemplateDir.length + 1), file };
            })
            .forEach((info) => {
                const content = FS.readFileSync(info.file).toString();
                templateEngine.registerPartial(info.id, content);
            });

        const out: GeneratedFile[] = [];

        templateFiles.forEach((fileName) => {
            const templateSource = FS.readFileSync(fileName).toString();

            //We always clone data in case a target implementation wants to change it
            const sourceCode = this._render(templateEngine, fileName, templateSource, _.cloneDeep(data), context);

            const filename = fileName.substring(kindTemplateDir.length + 1);

            const files = this._parseCode(filename, sourceCode);
            if (files.length) {
                out.push(...files);
            }
        });

        return out;
    }

    public async preprocess(data: any) {
        return data;
    }

    public async postprocess(targetDir: string, files: GeneratedAsset[]) {}

    public mergeFile(sourceFile: SourceFile, targetFile: GeneratedFile, lastFile: GeneratedFile|null): GeneratedFile {
        throw new Error('Could not merge changes for file: ' + sourceFile.filename + '. Merge not supported.');
    }

    private _parseCode(filename: string, sourceCode: string): GeneratedFile[] {
        const files: GeneratedFile[] = [];
        let currentFileContent: string[] = [];
        let currentFilename = filename;
        let currentMode = 'write-always';
        let currentPermissions = '644';

        const processCurrentFile = () => {
            if (currentMode === 'skip') {
                return;
            }

            // If file content is empty, skip it
            if (!currentFileContent.some((line) => line.trim())) {
                return;
            }

            if (currentFileContent.length > 0) {
                files.push({
                    filename: currentFilename,
                    content: this._postProcessCode(currentFilename, currentFileContent.join('\n')),
                    mode: currentMode,
                    permissions: currentPermissions,
                });
                currentFileContent = [];
            }
        };

        sourceCode.split(/\n/g).forEach((line) => {
            if (line.indexOf('#FILENAME:') > -1) {
                processCurrentFile(); // Process the previous file content

                const filenameModePermissions = line.split('#FILENAME:')[1];
                if (filenameModePermissions) {
                    [currentFilename, currentMode, currentPermissions] = filenameModePermissions.split(/:/g);
                    if (!currentMode) {
                        currentMode = 'write-always';
                    } else {
                        const match= currentMode.match(/\b(merge|create-only|write-always)\b/);
                        if (match) {
                            currentMode = match[1];
                        }
                    }
                    if (!currentPermissions) {
                        currentPermissions = '644';
                    }
                } else {
                    console.error('Invalid file header format in line: ' + line);
                }
            } else {
                currentFileContent.push(line);
            }
        });

        processCurrentFile(); // Ensure last file is processed

        return files;
    }
}
