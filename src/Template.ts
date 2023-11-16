/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import Handlebars from 'handlebars';
import _ from 'lodash';
import { HelperOptions } from 'handlebars';
import { CodeFormatter, TypeLike } from './CodeFormatter';
import { Entity, isBuiltInType, Kind } from '@kapeta/schemas';

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

        if (wildcard) {
            return data.kind.toLowerCase().startsWith(type);
        }

        const [name] = data.kind.split(':');
        if (type.indexOf(':') > -1) {
            //Requested type contains version
            return type.toLowerCase() === data.kind.toLowerCase();
        }

        return type.toLowerCase() === name.toLowerCase();
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

    function isDTO(type: any) {
        if (!type || !context.spec || !context.spec.entities || !context.spec.entities.types) {
            return false;
        }

        if (type.ref) {
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

    handlebarInstance.registerHelper('eachTypeReference', function (entity, options: HelperOptions) {
        const includeNonDTORefs = options?.hash && !!options.hash['all'];
        const found: string[] = [];
        const out: string[] = [];

        function maybeRenderType(type: string) {
            if (type.endsWith('[]')) {
                //Get rid of array indicator
                type = type.substring(0, type.length - 2);
            }

            if (type.includes('<')) {
                // Handle generics
                let [typeName, args] = type.split('<');
                const genericTypes = args.substring(0, args.length - 1).split(',');
                genericTypes.forEach((genericType) => {
                    maybeRenderType(genericType);
                });
                type = typeName.trim();
            }

            if (type === 'any' || type === 'Map' || type === 'Set' || isBuiltInType({ type })) {
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

            if (entity?.ref) {
                maybeRenderType(entity.ref);
                return;
            }

            if (typeof entity === 'object') {
                process(Object.values(entity));
            }
        }

        process(entity);

        return new handlebarInstance.SafeString(out.join(''));
    });

    handlebarInstance.registerHelper('arguments', function (items, options: HelperOptions) {
        const out: string[] = [];

        _.forEach(items, function (item, key) {
            item['argumentName'] = key;
            out.push(options.fn(item).trim().replace(/\n/gm, ' ').replace(/\s+/gm, ' '));
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

    return handlebarInstance;
}

export function SafeString(string: string): Handlebars.SafeString {
    return new Handlebars.SafeString(string);
}
