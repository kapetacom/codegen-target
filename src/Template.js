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
 * @param {CodeFormatter} codeFormatter
 */
function create(context, codeFormatter) {
    const handlebarInstance = Handlebars.create();


    /** Utils **/

    handlebarInstance.registerHelper('lowercase', function(typename) {
        return new handlebarInstance.SafeString(typename.toLowerCase());
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

    handlebarInstance.registerHelper('arguments', function(items, options) {
        var out = [];

        _.forEach(items, function(item, key) {
            item['argumentName'] = key;
            out.push(options.fn(item));
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