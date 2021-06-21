
## API

<details>
<summary>Table of Contents</summary>

+ eSQL (Express-SQL)
    + Class: `eSQL.Object`
        + `new eSQL.Object(options)`
    + Class: `eSQL.Connection`
        + `new eSQL.Connection(options)`
        + `connection.link(Object)`
    + Class: `eSQL.Schema`
        + `new eSQL.Schema(object)`
        + Type: `eSQL.Fixed`
        + Type: `eSQL.Enum`
        + Type: `eSQL.Null`
        + Other Types
    + `eSQL.definePaths(Object, options)`

</details>

<br>

### Class: `eSQL.Object`

#### `new eSQL.Object(options)`

+ `options` {Object}
    + `primaryKey` {string}  Used for the Read, Update, and Delete operations. It must be specified so that SQL knows what object to work with. If null or invalid, it will throw a `ValidationError`
    + `pathAlias` {string}  Remaps what the path parameter is specified as in express.
    + `table` {string}  The name of the table to modify in SQL
    + `makeID` {function}  A function that should return what the primary key should be in the case its not specified in the POST operation. By default this function returns a 6 digit number
    + `schema` {eSQL.Schema}  The schema used for request validation

Constructs the default class used in constructing routes and SQL queries

### Class: `eSQL.Connection`

#### `new eSQL.Connection(options)`

+ `options` {Object}

The Connection object is required to make any query to a remote server. This wraps around the default connection object used in the [mysql](https://github.com/mysqljs/mysql#todo) library, so you can find options for it there.

#### `connection.link(Object)`

+ `Object` {eSQL.Object} The object to be implemented into express
+ Returns: {Express.Router}

Used to create the router for an object to be implemented into express in the default CRUD style. It's worth noting that the router object that's returned does not reflect changes made to the eSQL object after the fact. It will need to be relinked.

### Class: `eSQL.Schema`

#### `new eSQL.Schema(object)`

+ `object` {Object}

Constructs a new schema object. This is primarily used for the Object, but can be used independently

#### Type: `eSQL.Fixed(type, length)`

+ `type` {Type}
+ `length` {number}

#### Type: `eSQL.Enum(...options)`

+ `options` {string[]}

#### Type: `eSQL.Null(type)`

+ `type` {Type}

#### Other Types

Currently, the only types supported are `Boolean`, `String`, and `Number` (more to come). They can be referenced by using the type literals used by node.