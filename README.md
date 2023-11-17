# Kapeta Code generator SDK

This module provides the SDK for implementing code generating targets

## Template Syntax

Other than normal Handlebars syntax, the codegen uses the `#FILENAME:` syntax in template output to define the file path and file permissions for the generated file(s). This allows each template to determine the path and file permissions for the file(s) from within the template itself.

### Filename Syntax

At the start of any template output, you can specify `#FILENAME:` followed by the file path and optional parameters. This line controls the generation of single or multiple files.

An example could be:

```javascript
#FILENAME:{{type data.name}}.ts:write-always:644
class {{type data.name}} {

}
```

The syntax of the filename line is:

```javascript
#FILENAME:<file path>[:<write mode=write-always>[:<file permissions=644>]]
```

Where:

- `file path`: The path of the file.
- `write mode`: Defaults to `write-always`. Options include:
  - `create-only`: Only writes the file if it doesn't exist. Ideal for generating boilerplate code that the user will need to modify to help speed things along.
  - `write-always`: Always overwrites the file, meaning any user changes will be overwritten. These files should not be adjusted by users.
  - `skip`: Does not generate the file.
  - `merge`: Attempts to merge generated code with any changes made by the user. Currently not supported.
- `file permissions`: The chmod value to apply to the file, useful if you need to generate executable files. Defaults to 644.

### Single File Generation

For generating a single file, the `#FILENAME:` syntax must be the first line of the template. The rest of the template will be the content of the file.

Example:

```javascript
#FILENAME:<file path>
...template content...
```

### Multiple File Generation

The `#FILENAME:` syntax can also be used multiple times (or, for example, within loop constructs) to generate multiple files based on the loop's context.

Syntax within a loop:

```javascript
{#each [context]}
#FILENAME:<file path based on context>
    ...template content...
{{/each}}
```

This enables the dynamic generation of file paths and contents based on the context of each iteration within the loop.

### Built-In Helpers

There is a list of built-in helpers which is documented below

#### lowercase

Simply make string lowercase

```handlebars
{{lowercase data.someString}}
```

#### curly

Make opening or closing curl braces. Useful when handlebars gets confused

```handlebars
Outputs "{"
{{curly true}}

Outputs "}"
{{curly}}
```

#### eachProperty

Iterates through a map and provides key of map as "propertyId"

```handlebars
{{#eachProperty myMap}}
    This property: [{{propertyId}}] has this value: [{{this}}]
{{/eachProperty}}
```

#### switch

Provides a switch structure to the template

```handlebars
{{#switch data.myValue}}
    {{#case 'test'}}
        Output when data.myValue is equal to 'test'
    {{/case}}
    {{#case 'test2'}}
        Output when data.myValue is equal to 'test2'
    {{/case}}
{{/switch}}
```

#### consumes / provides

Only renders if a block consumes / provides a certain kind of resource

```handlebars
{{#consumes 'kapeta/resource-type-rest-client'}}
    Only render if block consumes a REST client
{{/consumes}}
{{#provides 'kapeta/resource-type-rest-api'}}, Only render if block provides a REST API
{{/provides}}
```

#### consumers-of-type / providers-of-type

Iterates through all consumers or providers of a given type.

`metadata` contains the metadata of the consumer / provider

`spec` contains the spec of the consumer / provider

```handlebars
{{#consumers-of-type 'kapeta/resource-type-rest-client'}}
    Renders once per REST Client consumer. This one is called:
    {{type metadata.name}}.
{{/consumers-of-type}}
{{#providers-of-type 'kapeta/resource-type-rest-api'}}
    Renders once per REST API provider. This one is called:
    {{type metadata.name}}.
{{/providers-of-type}}
```

#### eachTypeReference

Renders once for every type reference ( `{$ref:'Type'}`) found in a data structure.

Useful when needing to import / require these references into the current file.

```handlebars
{{#eachTypeReference data}}
    Name of the reference:
    {{name}}
{{/eachTypeReference}}
```

Default behaviour is to only include data structures / entities. If you want to include enum values as well simply add the "all=true" argument:

```handlebars
{{#eachTypeReference data all=true}}
    Name of the reference:
    {{name}}
{{/eachTypeReference}}
```

#### More

There are more formatters and you can add additional ones specific to the language target you're building. See the CodeFormatter class. Each method in the codeformatter is available in the template without the `$`. E.g. `CodeFormatter::$returnType` is available as

```handlebars
{{returnType data.value}}
```

## Template names

Template names are basically the `kind` for both blocks and resources.

### `kapeta/block-type-service`

Templates for service blocks. Should contain core boilerplate for running, building and testing a service block for this language target - if applicable.

### `kapeta/block-type-frontend`

Templates for frontend blocks. Should contain core boilerplate for running, building and testing a frontend block for this language target - if applicable.

### `core/entity`

Templates for entities. Should handle both data structures and enums.

### `kapeta/resource-type-mongodb`

Templates for MongoDB. Should render setup for using a MongoDB Database.

### `kapeta/resource-type-postgresql`

Templates for Postgres. Should render setup for using a Postgres Database.

### `kapeta/resource-type-rest-api`

Templates for REST APIs. Should render code that provides a REST API for the block

### `kapeta/resource-type-rest-client`

Templates for REST Clients. Should render code that provides a REST Client for the block

**NOTE**: It is usually needed, for in particular resource types, to have some sort of Kapeta-specific SDK backing the code generation. Meaning the generated code uses a pre-built SDK.

This is because of how Kapeta automatically makes databases available Just-in-Time and to keep Kapeta in control of the traffic flowing between blocks - also locally.

## Exports

This module provides a few different things to aid in code generation using handlebars templates.

### Target

The most important class in this library - which all language targets should extend.

It takes `options`, `baseDir` and a `formatter` as arguments.

-   `options` is simply passed on to the templates
-   `baseDir` is the basedir of the language target. It expects a folder named `templates` to be in the baseDir which contains all templates.

The formatter is either the CodeFormatter or a sub-class of that.

See below for more on CodeFormatters.

#### Generating code

The main method for generating code using `Target` is `Target::generate(data, context)`. It will pass both data and context to the templates to be used.

It expects a `kind` property to exist on the "data" argument - which is how it determines which template to use.

The template(s) is determined by baseDir and kind - e.g. for kind: `"my.resource.type"` it will look for a folder named: `{baseDir}/templates/my.resource.type`. It will then iterate all files in that folder and generate code based on each of them.

### CodeFormatter

The code formatting base class contains a number of methods for formatting different types of common code structures

This is to make it easy to extend and override this formatting for different languages and conventions.

### Template

Contains a methods that sets up handlebars and otherwise helps with handlebar rendering.

The create method is called internally from Target and should usually not be used directly.

```javascript
Template.create(data, context, codeFormatter);
```

The SafeString method is simply wrapping handlebars safestring - to allow for rendering strings that handlebars otherwise would escape.

```javascript
Template.SafeString(someString);
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
