/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import Handlebars from 'handlebars';
import _ from 'lodash';
import { HelperOptions } from 'handlebars';
import { CodeFormatter, TypeLike } from './CodeFormatter';
import {BlockDefinitionSpec, Entity, isBuiltInType, Kind, Resource, SourceCode } from '@kapeta/schemas';
import { normalizeKapetaUri, parseKapetaUri } from '@kapeta/nodejs-utils';
import {
    CONFIG_CONFIGURATION,
    CONFIG_FIELD_ANNOTATIONS,
    DATATYPE_CONFIGURATION, DataTypeReader,
    DSLController, DSLData,
    DSLEntity,
    DSLEntityType,
    DSLMethod,
    DSLParser,
    DSLParserOptions,
    METHOD_CONFIGURATION,
    TYPE_INSTANCE, TYPE_INSTANCE_PROVIDER, TYPE_PAGEABLE, typeHasReference,
} from '@kapeta/kaplang-core';


Handlebars.noConflict(); //Remove from global space

export type TemplateType = typeof Handlebars;

function findKindCaseInsensitive(type: string) {
    type = type.toLowerCase();

    let wildcard = false;
    if (type.endsWith('*')) {
        type = type.substring(0, type.length - 1);
        wildcard = true;
    }

    return (data: Kind) => {
        if (!data || !data.kind) {
            return false;
        }

        const kindUri = parseKapetaUri(data.kind);

        if (wildcard) {
            return kindUri.fullName.startsWith(type);
        }

        if (type.indexOf(':') > -1) {
            //Requested type contains version
            return normalizeKapetaUri(type) === kindUri.toNormalizedString();
        }

        return parseKapetaUri(type).fullName === kindUri.fullName;
    };
}
/**
 *
 * @param data {object}
 * @param context {object}
 * @param {CodeFormatter} codeFormatter
 */
export function create(data: any, context: any, codeFormatter: CodeFormatter): TemplateType {
    const handlebarInstance = Handlebars.create();

    if (!data) {
        throw new Error('Missing data');
    }

    if (!context) {
        throw new Error('Missing context');
    }

    /** Utils **/

    handlebarInstance.registerHelper('lowercase', function (typename) {
        return new handlebarInstance.SafeString(typename.toLowerCase());
    });

    handlebarInstance.registerHelper('uppercase', function (typename) {
        return new handlebarInstance.SafeString(typename.toUpperCase());
    });

    handlebarInstance.registerHelper('default', function (value, defaultValue) {
        return new handlebarInstance.SafeString(value ?? defaultValue);
    });

    handlebarInstance.registerHelper('json', function (value) {
        return new handlebarInstance.SafeString(JSON.stringify(value));
    });

    handlebarInstance.registerHelper('json-string', function (value) {
        return new handlebarInstance.SafeString(JSON.stringify(JSON.stringify(value)));
    });

    handlebarInstance.registerHelper('assetName', function (typename) {
        if (typename.indexOf('/') === -1) {
            return new handlebarInstance.SafeString(typename);
        }
        return new handlebarInstance.SafeString(typename.split('/')[1]);
    });

    handlebarInstance.registerHelper('dashify', function (typename) {
        return new handlebarInstance.SafeString(typename.replace(/_/g, '-').replace(/\//g, '-'));
    });

    handlebarInstance.registerHelper('curly', function (object, open) {
        return open ? '{' : '}';
    });

    handlebarInstance.registerHelper('kebab', (camelCase) => {
        return new handlebarInstance.SafeString(camelCase.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
    });

    handlebarInstance.registerHelper('when', (type, options) => {
        const inner = options.fn();
        const [whenTrue, whenFalse] = inner.split(/\|\|/);
        if (options.hash && options.hash.type === type) {
            return new handlebarInstance.SafeString(whenTrue);
        }
        return new handlebarInstance.SafeString(whenFalse || '');
    });

    handlebarInstance.registerHelper('eachProperty', function (items: any, options: HelperOptions) {
        const out: string[] = [];

        _.forEach(items, function (item, key) {
            out.push(options.fn({ ...item, propertyId: key }));
        });

        return out.join('');
    });

    handlebarInstance.registerHelper('switch', function (this: any, value, options: HelperOptions) {
        this.switch_value = value.toString();
        return options.fn(this);
    });

    handlebarInstance.registerHelper('case', function (this: any, value, options: HelperOptions) {
        if (value.toString() === this.switch_value) {
            return options.fn(this);
        }
    });

    handlebarInstance.registerHelper('consumes', function (this: any, type, options: HelperOptions) {
        if (!context.spec.consumers) {
            return options.inverse(this);
        }

        if (_.find(context.spec.consumers, findKindCaseInsensitive(type))) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    handlebarInstance.registerHelper('provides', function (this: any, type, options: HelperOptions) {
        if (!context.spec.providers) {
            return '';
        }

        if (_.find(context.spec.providers, findKindCaseInsensitive(type))) {
            return options.fn(this);
        }
    });

    handlebarInstance.registerHelper('consumers-of-type', function (type, options: HelperOptions) {
        if (!context.spec.consumers) {
            return '';
        }

        const out: string[] = [];
        _.filter(context.spec.consumers, findKindCaseInsensitive(type)).forEach((consumer) => {
            out.push(options.fn(consumer));
        });
        return out.join('\n');
    });

    handlebarInstance.registerHelper('providers-of-type', function (type, options: HelperOptions) {
        if (!context.spec.providers) {
            return '';
        }
        const out: string[] = [];
        _.filter(context.spec.providers, findKindCaseInsensitive(type)).forEach((provider) => {
            out.push(options.fn(provider));
        });
        return out.join('\n');
    });

    /** Code formatters **/

    handlebarInstance.registerHelper('type', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$type(typename));
    });

    handlebarInstance.registerHelper('constant', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$constant(typename));
    });

    handlebarInstance.registerHelper('comment', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$comment(typename));
    });

    handlebarInstance.registerHelper('namespace', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$namespace(typename));
    });

    handlebarInstance.registerHelper('variable', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$variable(typename));
    });

    handlebarInstance.registerHelper('string', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$string(typename));
    });

    handlebarInstance.registerHelper('method', function (typename) {
        return new handlebarInstance.SafeString(codeFormatter.$method(typename));
    });

    handlebarInstance.registerHelper('returnType', function (typename: TypeLike) {
        return new handlebarInstance.SafeString(codeFormatter.$returnType(typename));
    });

    handlebarInstance.registerHelper('getter', function (typename, propertyId) {
        return new handlebarInstance.SafeString(codeFormatter.$getter(typename, propertyId));
    });

    handlebarInstance.registerHelper('setter', function (typename, propertyId) {
        return new handlebarInstance.SafeString(codeFormatter.$setter(typename, propertyId));
    });

    handlebarInstance.registerHelper('concat', (a: string, b:string) => {
        return a + b;
    });

    handlebarInstance.registerHelper('toArray', (...value: any[]) => {
        return value.slice(0, value.length - 1);
    });

    handlebarInstance.registerHelper('usesAnyOf', function (this:any, kinds: string[], options) {
        const data = context.spec as BlockDefinitionSpec;
        const usesAny = kinds.some((kind) => {
            const uri = parseKapetaUri(kind);
            const matcher = (consumer: Resource) => parseKapetaUri(consumer.kind).fullName === uri.fullName;
            return data.consumers?.some(matcher) || data.providers?.some(matcher);
        });

        if (usesAny) {
            return options.fn(this);
        }

        return options.inverse(this);
    });


    function isDTO(type: any) {
        if (!type || !context.spec || !context.spec.entities || !context.spec.entities.types) {
            return false;
        }

        if (typeof type.ref === 'string') {
            type = type.ref;
        }

        if (type.type) {
            type = type.type;
        }

        type = type.toLowerCase();
        return context.spec.entities.types.some((entity: Entity) => {
            return entity && entity.type === 'dto' && entity.name && entity.name.toLowerCase() === type;
        });
    }

    const BUILT_IN_REFS = [
        TYPE_INSTANCE,
        TYPE_INSTANCE_PROVIDER,
        TYPE_PAGEABLE,
    ]

    function normalizeType(type:string):string[] {
        if (!type) {
            return [];
        }
        let types:string[] = [];
        if (type.endsWith('[]')) {
            //Get rid of array indicator
            type = type.substring(0, type.length - 2);
        }

        if (type.includes('<')) {
            // Handle generics
            let [typeName, args] = type.split('<');
            const genericTypes = args.substring(0, args.length - 1).split(',');
            types = [...genericTypes];
            type = typeName.trim();
        }

        return [type, ...types];
    }

    handlebarInstance.registerHelper('eachTypeReference', function (entity, options: HelperOptions) {
        const includeNonDTORefs = options?.hash && !!options.hash['all'];
        const found: string[] = [];
        const out: string[] = [];

        function maybeRenderType(type: string) {
            if (type === 'any' || type === 'Map' || type === 'Set' || isBuiltInType({ type })) {
                // Special built-in type
                return;
            }

            if (BUILT_IN_REFS.includes(type)) {
                // Special built-in type
                return;
            }

            if (!includeNonDTORefs && !isDTO(type)) {
                return;
            }

            if (found.indexOf(type) > -1) {
                return;
            }

            found.push(type);
            out.push(options.fn({ name: type }));
        }

        function process(entity: any | any[]) {
            if (!entity) {
                return;
            }

            if (Array.isArray(entity)) {
                entity.forEach(process);
                return;
            }

            if (typeof entity?.ref === 'string') {
                normalizeType(entity.ref).forEach(maybeRenderType);
                return;
            }

            if (typeof entity === 'object') {
                process(Object.values(entity));
            }
        }

        process(entity);

        return new handlebarInstance.SafeString(out.join(''));
    });

    handlebarInstance.registerHelper('hasTypeReference', function (this:any, entity:any, type:string, options: HelperOptions) {
        let found: boolean = false;

        function process(entity: any | any[]) {
            if (!entity || found) {
                return;
            }

            if (Array.isArray(entity)) {
                entity.forEach(process);
                return;
            }

            if (typeof entity?.ref === 'string') {
                if (normalizeType(entity.ref).includes(type)) {
                    found = true;
                }
                return;
            }

            if (typeof entity === 'object') {
                process(Object.values(entity));
            }
        }

        process(entity);

        if (found) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    handlebarInstance.registerHelper('arguments', function (items: {[key:string]:any}, options: HelperOptions) {
        const args = Object.entries(items).map(([key, value], index) => {
            return {
                argumentName: key,
                index,
                ...value
            }
        });

        args.sort((a, b) => {
            if (a.optional && !b.optional) {
                return 1;
            }
            if (!a.optional && b.optional) {
                return -1;
            }
            return a.index - b.index;
        })

        const out = args.map((item) => {
            return options.fn(item).trim().replace(/\n/gm, ' ').replace(/\s+/gm, ' ')
        });

        return codeFormatter.$arguments(out);
    });

    handlebarInstance.registerHelper('methods', function (items, options: HelperOptions) {
        const out: string[] = [];

        _.forEach(items, function (item, key) {
            item['methodName'] = key;
            out.push(options.fn(item));
        });

        return codeFormatter.$methods(out);
    });

    function parseKaplang(source:SourceCode, parserOptions:DSLParserOptions,  options: HelperOptions) {
        if (!source || !source.value) {
            return '';
        }

        const baseControllerName:string =  options.data?.root?.data?.metadata?.name ?? 'main';

        const validTypes:string[] = parserOptions.validTypes ?? [];

        try {
            const results = DSLParser.parse(source.value, {
                ...parserOptions,
                validTypes,
                ignoreSemantics: true, // We're expecting valid code - this is not a good place to validate
            });

            if (results.errors?.length &&
                results.errors?.length > 0) {

                throw new Error(`Failed to parse source code: ${results.errors.join(', ')}`);
            }

            if (!results.entities) {
                return new handlebarInstance.SafeString('');
            }

            const methods = results.entities.filter((entity) => entity.type === DSLEntityType.METHOD) as DSLMethod[];

            const AnonymousController: DSLController = {
                type: DSLEntityType.CONTROLLER,
                name: baseControllerName,
                path: '/',
                methods,
            };

            const remainingEntities:DSLEntity[] = results.entities
                .filter((entity) => entity.type !== DSLEntityType.METHOD)
                .map((entity) => {
                    if (entity.type === DSLEntityType.CONTROLLER) {
                        return {
                            ...entity,
                            namespace: entity.namespace ?? baseControllerName,
                        };
                    }
                    return entity;
                });
            if (methods.length > 0) {
                remainingEntities.push(AnonymousController);
            }

            const out: string[] = remainingEntities.map((entity) => {
                return options.fn(entity);
            });

            return new handlebarInstance.SafeString(out.join('\n'));
        } catch (e:any) {
            console.warn('Failed to parse source code: %s\n\n----\n', e.stack, source.value);
            throw e;
        }
    }

    handlebarInstance.registerHelper('kaplang-has-reference', function (this:any, entity: DSLData, typeName, options:HelperOptions) {
        if (entity.type !== DSLEntityType.DATATYPE) {
            return options.inverse(this);
        }

        if (typeHasReference(entity, typeName)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    handlebarInstance.registerHelper('kaplang-render', function (this:any, entity:DSLEntity, options: HelperOptions) {
        const isData = entity.type === DSLEntityType.DATATYPE || entity.type === DSLEntityType.ENUM;
        if (isData && DataTypeReader.isNative(entity)) {
            console.log('Skipping native type: %s', entity.name);
            return options.inverse(this);
        }

        return options.fn(this);
    });

    handlebarInstance.registerHelper('kaplang-config', function (source:SourceCode, options: HelperOptions) {
        return parseKaplang(source, {
            ...CONFIG_CONFIGURATION
        }, options);
    });

    handlebarInstance.registerHelper('kaplang-types', function (source:SourceCode, options: HelperOptions) {
        return parseKaplang(source, {
            ...DATATYPE_CONFIGURATION,
        }, options);
    });

    handlebarInstance.registerHelper('kaplang-methods', function (source:SourceCode, options: HelperOptions) {
        return parseKaplang(source, {
            ...METHOD_CONFIGURATION,
            rest: false,
        }, options);
    });

    handlebarInstance.registerHelper('kaplang-rest-methods', function (source:SourceCode, options: HelperOptions) {
        return parseKaplang(source, {
            ...METHOD_CONFIGURATION,
            rest: true,
        }, options);
    });

    return handlebarInstance;
}

export function SafeString(string: string): Handlebars.SafeString {
    return new Handlebars.SafeString(string);
}
