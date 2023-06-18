export type TypeLike =
    | string
    | {
          type?: string;
          ref?: string;
      };

export function toTypeName(typeLike: TypeLike) {
    let text = '';
    if (typeof typeLike === 'string') {
        text = typeLike;
    } else if (typeLike.type) {
        text = typeLike.type;
    } else if (typeLike.ref) {
        text = typeLike.ref;
    }
    return text;
}

export class CodeFormatter {
    private _ucfirst(text: string): string {
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }

    $comment(value: string): string {
        return value;
    }

    $method(value: string): string {
        return value;
    }

    $namespace(value: string): string {
        return value.toLowerCase();
    }

    $arguments(values: string[]): string {
        return values.join(', ');
    }

    $methods(values: string[]): string {
        return values.join('\n\n');
    }

    $type(value?: TypeLike): string {
        let strValue: string = value ? toTypeName(value) : '';

        if (!value || !strValue) {
            return 'void';
        }

        return this._ucfirst(strValue);
    }

    $constant(value: string): string {
        return value.toUpperCase();
    }

    $variable(value: string): string {
        const typeName = this.$type(value);

        return typeName.substring(0, 1).toLowerCase() + typeName.substring(1);
    }

    $string(value: string): string {
        return value;
    }

    $getter(typeName: string, propertyId: string): string {
        let prefix = 'get';
        if (typeName.toLowerCase() === 'boolean') {
            prefix = 'is';
        }

        return prefix + this._ucfirst(propertyId);
    }

    $setter(typeName: string, propertyId: string): string {
        let prefix = 'set';
        return prefix + this._ucfirst(propertyId);
    }

    $returnType(value: TypeLike): string {
        if (!value) {
            return 'void';
        }

        return this.$type(value);
    }
}
