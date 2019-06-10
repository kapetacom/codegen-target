



class CodeFormatter {

    _ucfirst(text) {
        return text.substr(0,1).toUpperCase() + text.substr(1);
    }

    $comment(value) {
        return value;
    }

    $method(value) {
        return value;
    }

    $namespace(value) {
        return value.toLowerCase();
    }

    $arguments(values) {
        return values.join(', ');
    }

    $methods(values) {
        return values.join('\n\n');
    }

    $type(value) {
        if (!value) {
            return value;
        }
        return value.substr(0,1).toUpperCase() + value.substr(1);
    }

    $constant(value) {
        return value.toUpperCase();
    }

    $variable(value) {
        if (!value) {
            return value;
        }
        return value.substr(0,1).toLowerCase() + value.substr(1);
    }

    $string(value) {
        return value;
    }

    $getter(typeName, propertyId) {
        let prefix = 'get';
        if (typeName.toLowerCase() === 'boolean') {
            prefix = 'is';
        }

        return prefix + this._ucfirst(propertyId);
    }

    $setter(typeName, propertyId) {
        let prefix = 'set';
        return prefix + this._ucfirst(propertyId);
    }

    $setter(value) {
        return value;
    }

    $returnType(value) {
        if (!value) {
            return 'void';
        }

        return this.$type(value);
    }

}

module.exports = CodeFormatter;