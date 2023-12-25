import prettier from 'prettier';

const DefaultPrettierConfig: PrettierConfig = require('@kapeta/prettier-config');

interface PrettierOverride {
    files: string[] | string;
    options: PrettierOptions;
    excludeFiles?: string[] | string;
    parser: string;

}

interface PrettierOptions {
    arrowParens?: 'always' | 'avoid';
    bracketSameLine?: boolean;
    bracketSpacing?: boolean;
    cursorOffset?: number;
    embeddedLanguageFormatting?: 'auto' | 'off';
    endOfLine?: 'auto' | 'lf' | 'crlf' | 'cr';
    filepath?: string;
    htmlWhitespaceSensitivity?: 'css' | 'strict' | 'ignore';
    insertPragma?: boolean;
    jsxSingleQuote?: boolean;
    parser?: 'babel' | 'babel-flow' | 'babel-ts' | 'flow' | 'typescript' | 'css' | 'less' | 'scss' | 'json' | 'json5' | 'json-stringify' | 'graphql' | 'markdown' | 'mdx' | 'html' | 'vue' | 'angular' | 'yaml';
    pluginSearchDirs?: string[];
    plugins?: string[];
    printWidth?: number;
    proseWrap?: 'always' | 'never' | 'preserve';
    quoteProps?: 'as-needed' | 'consistent' | 'preserve';
    rangeEnd?: number;
    rangeStart?: number;
    requirePragma?: boolean;
    semi?: boolean;
    singleAttributePerLine?: boolean;
    singleQuote?: boolean;
    tabWidth?: number;
    trailingComma?: 'none' | 'es5' | 'all';
    useTabs?: boolean;
    vueIndentScriptAndStyle?: boolean;
}

interface PrettierConfig extends PrettierOptions {
    overrides?: PrettierOverride[];
}

export function format(filename: string, code: string) {
    if (filename.endsWith('.md') ||
        filename.endsWith('.txt')) {
        // Don't format markdown or text files
        return code;
    }

    const opts: PrettierConfig = {
        ...DefaultPrettierConfig,
        filepath: filename,
    };

    try {
        return prettier.format(code, opts);
    } catch (e: any) {
        if (e.message.includes('No parser could be inferred for file')) {
            // Expected error, don't log
            return code;
        }
        console.log('Failed to prettify source: ' + filename + '. ' + e);
        return code;
    }
}