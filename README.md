# Blockware Code generator SDK 
This module provides the SDK for implementing code generating targets

## Template Syntax
Other than normal handlebars syntax - the codegen will handle
the first line of the output rendered for any template specially
if that line starts with ```#FILENAME:```

This is to allow each template to determine its file path and file permissions 
from within the template itself. 

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
Where 
- ```file path```: is simply the path of the file. 
- ```write mode```: Defaults to ```write-always```. Can be one of the following:
  - ```create-only```: Only write the file if it doesn't exist. Makes sense for generating boilerplate code that the user will need to modify - just to help speed things along.
  - ```write-always```: If used will always overwrite the file - which also means any user changes will be overwritten. These files should not be adjusted by users.
  - ```skip```: Do not generate the file
  - ```merge```: Attempt to merge generated code with any changes made by user. Currently not supported.
- ```file permissions```: the chmod value to apply to the file. Useful if you need to generate executable files. Defaults to ```644``` 

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
{{#consumes 'rest.blockware.com/v1/Client'}}
    Only render if block consumes a REST client
{{/consumes}}
{{#provides 'rest.blockware.com/v1/API'}},
    Only render if block provides a REST API
{{/provides}}
```


#### consumers-of-type / providers-of-type
Iterates through all consumers or providers of a given type.

```metadata``` contains the metadata of the consumer / provider

```spec``` contains the spec of the consumer / provider
```handlebars
{{#consumers-of-type 'rest.blockware.com/v1/Client'}}
  Renders once per REST Client consumer. This one is called: {{type metadata.name}}.
{{/consumers-of-type}}
{{#providers-of-type 'rest.blockware.com/v1/API'}}
  Renders once per REST API provider. This one is called: {{type metadata.name}}.
{{/providers-of-type}}
```

#### eachTypeReference
Renders once for every type reference ( ```{$ref:'Type'}```) found in a data structure.

Useful when needing to import / require these references into the current file.
```handlebars
{{#eachTypeReference data}}
Name of the reference: {{name}}
{{/eachTypeReference}}
```

Default behaviour is to only include data structures / entities. 
If you want to include enum values as well simply add the "all=true" argument:
```handlebars
{{#eachTypeReference data all=true}}
Name of the reference: {{name}}
{{/eachTypeReference}}
```

#### More
There are more formatters and you can add additional ones specific to the language
target you're building. See the CodeFormatter class. Each method in the codeformatter
is available in the template without the $. 
E.g. ```CodeFormatter::$returnType``` is available as 
```handlebars 
{{returnType data.value}}
``` 

## Template names
Template names are basically the ```kind``` for both blocks and resources.

### ```blocks.blockware.com/v1/service```
Templates for service blocks. Should contain core boilerplate for running, 
building and testing a service block for this language target - if applicable.

### ```blocks.blockware.com/v1/frontend```
Templates for frontend blocks. Should contain core boilerplate for running, 
building and testing a frontend block for this language target - if applicable.
 
### ```core.blockware.com/v1/entity```
Templates for entities. Should handle both data structures and enums.

### ```nosqldb.blockware.com/v1/mongodb```
Templates for MongoDB. Should render setup for using a MongoDB Database.

### ```sqldb.blockware.com/v1/postgresql```
Templates for Postgres. Should render setup for using a Postgres Database.

### ```rest.blockware.com/v1/api```
Templates for REST APIs. Should render code that provides a REST API for the block

### ```rest.blockware.com/v1/client```
Templates for REST Clients. Should render code that provides a REST Client for the block

**NOTE**: It is usually needed, for in particular resource types,
to have some sort of Blockware-specific SDK backing the code generation. 
Meaning the generated code uses a pre-built SDK.

This is because of how Blockware automatically makes databases available Just-in-Time
and to keep Blockware in control of the traffic flowing between blocks - also locally. 

## Exports
This module provides a few different things to aid in code generation using
handlebars templates.

### Target
The most important class in this library - which all language targets should
extend.

It takes ```options```, ```baseDir``` and a ```formatter``` as arguments.
- ```options``` is simply passed on to the templates
- ```baseDir``` is the basedir of the language target. It expects a folder named ```templates``` to be in the baseDir which contains all templates.

The formatter is either the CodeFormatter or a sub-class of that.

See below for more on CodeFormatters.

#### Generating code
The main method for generating code using ```Target```
is ```Target::generate(data, context)```.
It will pass both data and context to the templates to be used.

It expects a ```kind``` property to exist on the "data" argument -
which is how it determines which template to use.

The template(s) is determined by baseDir and kind - e.g. for kind: ```"my.resource.type"```
it will look for a folder named:
```{baseDir}/templates/my.resource.type```.
It will then iterate all files in that folder and generate code based on each of them.


### CodeFormatter
The code formatting base class contains a number of methods for formatting
different types of common code structures

This is to make it easy to extend and override this formatting for different
languages and conventions.

### Template
Contains a methods that sets up handlebars and otherwise helps with handlebar
rendering.

The create method is called internally from Target and should usually not be used directly.
```javascript
Template.create(data, context, codeFormatter)
```

The SafeString method is simply wrapping handlebars safestring - to allow
for rendering strings that handlebars otherwise would escape.
```javascript
Template.SafeString(someString)
```
