
export type TypeInfo = string | {
    ref?:string
    type?:string
}

export class CodeFormatter {

    private _ucfirst(text:string):string {
        return text.substring(0,1).toUpperCase() + text.substring(1);
    }

    $comment(value):string {
        return value;
    }

    $method(value):string {
        return value;
    }

    $namespace(value):string {
        return value.toLowerCase();
    }

    $arguments(values):string {
        return values.join(', ');
    }

    $methods(values):string {
        return values.join('\n\n');
    }

    $type(value?:TypeInfo):string {
        let strValue:string = '';

        if (typeof value === 'string') {
            strValue = value;
        } else if (value) {
            strValue = '';
            if (value.ref) {
                strValue = value.ref;
            } else if (value.type) {
                strValue = value.type;
            }
        }

        if (!value || !strValue) {
            return 'void';
        }

        return this._ucfirst(strValue);
    }

    $constant(value):string {
        return value.toUpperCase();
    }

    $variable(value):string {
        const typeName = this.$type(value);

        return typeName.substr(0,1).toLowerCase() + typeName.substr(1);
    }

    $string(value):string {
        return value;
    }

    $getter(typeName, propertyId):string {
        let prefix = 'get';
        if (typeName.toLowerCase() === 'boolean') {
            prefix = 'is';
        }

        return prefix + this._ucfirst(propertyId);
    }

    $setter(typeName, propertyId):string {
        let prefix = 'set';
        return prefix + this._ucfirst(propertyId);
    }

    $returnType(value):string {
        if (!value) {
            return 'void';
        }

        return this.$type(value);
    }

}
