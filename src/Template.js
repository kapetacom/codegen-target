const Handlebars = require('handlebars');
const _ = require('lodash');

Handlebars.noConflict(); //Remove from global space


function findKindCaseInsensitive(type) {

    type = type.toLowerCase();

    let wildcard = false;
    if (type.endsWith('*')) {
        type = type.substr(0, type.length - 1);
        wildcard = true;
    }

    return (data) => {
        if (!data ||
            !data.kind) {
            return false;
        }

        if (wildcard) {
            return data.kind.toLowerCase().startsWith(type);
        }

        return (type.toLowerCase() === data.kind.toLowerCase());
    }
}
/**
 *
 * @param data {object}
 * @param context {object}
 * @param {CodeFormatter} codeFormatter
 */
function create(data, context, codeFormatter) {
    const handlebarInstance = Handlebars.create();

    if (!data) {
        throw new Error('Missing data');
    }

    if (!context) {
        throw new Error('Missing context');
    }

    /** Utils **/

    handlebarInstance.registerHelper('lowercase', function(typename) {
        return new handlebarInstance.SafeString(typename.toLowerCase());
    });

    handlebarInstance.registerHelper('assetName', function(typename) {
        if (typename.indexOf("/") === -1) {
            return new handlebarInstance.SafeString(typename);
        }
        return new handlebarInstance.SafeString(typename.split("/")[1]);
    });

    handlebarInstance.registerHelper('dashify', function(typename) {
        return new handlebarInstance.SafeString(typename.replace(/\_/g, '-').replace(/\//g, '-'));
    });

    handlebarInstance.registerHelper('curly', function(object, open) {
        return open ? '{' : '}';
    });

    handlebarInstance.registerHelper('eachProperty', function(items, options) {
        var out = [];

        _.forEach(items, function(item, key) {
            item['propertyId'] = key;
            out.push(options.fn(item));
        });

        return out.join('');
    });



    handlebarInstance.registerHelper('switch', function(value, options) {
        this.switch_value = value;
        return options.fn(this);
    });

    handlebarInstance.registerHelper('case', function(value, options) {
        if (value === this.switch_value) {
            return options.fn(this);
        }
    });

    handlebarInstance.registerHelper('consumes', function(type, options) {
        if (!context.spec.consumers) {
            return '';
        }

        if (_.find(context.spec.consumers, findKindCaseInsensitive(type))) {
            return options.fn(this);
        }

    });

    handlebarInstance.registerHelper('provides', function(type, options) {
        if (!context.spec.providers) {
            return '';
        }

        if (_.find(context.spec.providers, findKindCaseInsensitive(type))) {
            return options.fn(this);
        }
    });

    handlebarInstance.registerHelper('consumers-of-type', function(type, options) {
        if (!context.spec.consumers) {
            return '';
        }

        var out = [];
        _.filter(context.spec.consumers, findKindCaseInsensitive(type)).forEach((consumer) => {
            out.push(options.fn(consumer));
        });
        return out.join('\n');
    });

    handlebarInstance.registerHelper('providers-of-type', function(type, options) {
        if (!context.spec.providers) {
            return '';
        }
        var out = [];
        _.filter(context.spec.providers, findKindCaseInsensitive(type)).forEach((provider) => {
            out.push(options.fn(provider));
        });
        return out.join('\n');
    });


    /** Code formatters **/

    handlebarInstance.registerHelper('type', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$type(typename));
    });

    handlebarInstance.registerHelper('constant', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$constant(typename));
    });

    handlebarInstance.registerHelper('comment', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$comment(typename));
    });

    handlebarInstance.registerHelper('namespace', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$namespace(typename));
    });

    handlebarInstance.registerHelper('variable', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$variable(typename));
    });

    handlebarInstance.registerHelper('string', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$string(typename));
    });

    handlebarInstance.registerHelper('method', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$method(typename));
    });

    handlebarInstance.registerHelper('returnType', function(typename) {
        return new handlebarInstance.SafeString(codeFormatter.$returnType(typename));
    });

    handlebarInstance.registerHelper('getter', function(typename, propertyId) {
        return new handlebarInstance.SafeString(codeFormatter.$getter(typename, propertyId));
    });

    handlebarInstance.registerHelper('setter', function(typename, propertyId) {
        return new handlebarInstance.SafeString(codeFormatter.$setter(typename, propertyId));
    });

    function isDTO(type) {
        if (!type ||
            !context.spec ||
            !context.spec.entities ||
            !context.spec.entities.types) {
            return false;
        }

        if (type.$ref) {
            type = type.$ref;
        }

        type = type.toLowerCase();
        return context.spec.entities.types.some((entity) => {
            return (entity && entity.type === 'dto' && entity.name && entity.name.toLowerCase() === type);
        });
    }

    handlebarInstance.registerHelper('eachTypeReference', function(entity, options) {
        const includeNonDTORefs = options && options.hash && !!options.hash['all']
        const found = [];
        const out = [];

        function process(entity) {
            if (!entity) {
                return;
            }

            if (Array.isArray(entity)) {
                entity.forEach(process);
                return;
            }

            if (entity &&
                entity.$ref) {
                const type = entity.$ref;
                if (!includeNonDTORefs && !isDTO(type)) {
                    return;
                }

                if (found.indexOf(type) > -1) {
                    return;
                }

                found.push(type);
                out.push(options.fn({name: type}));
            }

            if (typeof entity === 'object') {
                process(Object.values(entity));
            }
        }

        process(entity);

        return new handlebarInstance.SafeString(out.join(''));
    });

    handlebarInstance.registerHelper('arguments', function(items, options) {
        var out = [];

        _.forEach(items, function(item, key) {
            item['argumentName'] = key;
            out.push(options.fn(item).trim()
                .replace(/\n/gm, ' ')
                .replace(/\s+/gm, ' '));
        });

        return codeFormatter.$arguments(out);
    });

    handlebarInstance.registerHelper('methods', function(items, options) {
        var out = [];

        _.forEach(items, function(item, key) {
            item['methodName'] = key;
            out.push(options.fn(item));
        });

        return codeFormatter.$methods(out);
    });

    return handlebarInstance;
}


exports.create = create;

exports.SafeString = function(string) {
    return new Handlebars.SafeString(string);
};