
<details>
<summary>Table of Contents</summary>

+ eSQL (Express-SQL)
    + Class: `eSQL.Object`
        + `new eSQL.Object(options)`
    + Class: `eSQL.Connection`
        + `new eSQL.Connection(options)`
        + `connection.link(Object)`
    + Class: `eSQL.Schema`
        + The Schema Object and Types
        + `new eSQL.Schema(object)`
        + `schema.validate(object)`
        + Type: `eSQL.Fixed`
        + Type: `eSQL.Enum`
        + Other Types
    + `eSQL.definePaths(Object, options)`

</details>

### Class: `eSQL.Object`

#### `new eSQL.Object(options)`

+ `options` {Object}
    + `primaryKey` {string}
    + `pathAlias` {string}
    + `schema` {eSQL.Schema}

### Class: `eSQL.Connection`

#### `new eSQL.Connection(options)`

+ `options` {Object}

#### `connection.link(Object)`

+ `Object` {eSQL.Object}
+ Returns: {Express.Router}

### Class: `eSQL.Schema`

#### `new eSQL.Schema(object)`

+ `object` {Object}

#### Type: `eSQL.Fixed(type, length)`

+ `type` {Type}
+ `length` {number}

#### Type: `eSQL.Enum(...options)`

+ `options` {string[]}

#### Other Types

### `eSQL.definePaths(Object, options)`

+ `Object` {eSQL.Object}
+ `options` {Object}