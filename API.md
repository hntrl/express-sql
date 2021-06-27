
## API

<details>
<summary>Table of Contents</summary>

+ eSQL (Express-SQL)
    + Class: `eSQL.Object`
        + `new eSQL.Object(options)`
        + `object.use()`
    + Class: `eSQL.Connection`
        + `eSQL.Connection(options)`
        + `connection.query(queryString)`
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

#### `object.use()`

+ Returns {Express.Router} The router used to handle object requests

### Class: `eSQL.Connection`

#### `eSQL.Connection(options)`

+ `options` {Object}
+ Returns: {Express.Router} The router returned will make all express requests access this object using `req.conn`

The Connection object is required to make any query to a remote server. This wraps around the default connection object used in the [mysql](https://github.com/mysqljs/mysql#todo) library, so you can find options for it there.

#### `connection.query(query)`

+ `query` {String} The query string to be sent out
+ Returns {Object[]} The response from the remote server

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