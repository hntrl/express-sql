
### `🚨 This package is in early development. Things might not work as intended or might not be documented properly.`

If you stumble upon a problem or a potential improvement, please open an issue or PR!

## Express-SQL (eSQL)

CRUD (Create, Read, Update, Delete) style object mapping for SQL objects.

### Install

`$ npm install express-sql`

### Usage

```js
const express = require("express");
const eSQL = require("express-sql");

const app = express();

app.use(
    eSQL.Connection({
        host: "localhost:3306",
        username: "timmy",
        password: "letmein"
    })
)

let Person = new eSQL.Object({
    primaryKey: "ID",
    table: "people",
    schema: {
        ID: Number,
        Name: String
    }
})

app.use("/people", Person.use());

app.listen(3000);
```

`eSQL.Connection` shares the same options as the connection object in [mysql](https://github.com/mysqljs/mysql#connection-options).

The above example creates 4 routes

```
POST /people - { ID: Number, Name: String }
GET /people/:ID - ID=Number
PUT /people/:ID - ID=Number, { Name: String }
DELETE /people/:ID - ID=Number
```

`POST /people - { ID: 1, Name: 'Homer', Cool: false }: 400 Bad Request`

eSQL will verify the params for any request according to the schema before sending it to SQL.

If you want to modify the request body to make your SQL schema different from your API schema, you can specify a mapping.

```js
new eSQL.Object({
    primaryKey
    schema: {
        ID: Number,
        Name: String
    },
    mapping: {
        id: "ID",
        firstname: "Name"
    }
})
```

<details>
<summary>for the clean freaks like me</summary>

```js
{
    primaryKey: "id",
    schema: {
        id: ["ID", Number],
        firstname: ["Name", String]
    }
}
```
*this has the same effect*

</details>

<br>

### Additional Options

```js
new eSQL.Object({
    primaryKey: 'ID',
    pathAlias: 'personId',  // Changes the express route to /:personId
    table: 'people',  // The table to do operations on
    makeID: () => uuid(),  // Specify the method to create the id from
    schema: {
        ID: Number,
        Name: String
    },
})
```

### Type Definitions

`String`, `Number`, `Boolean` are the only types supported by eSQL right now (more to come). However you can specify types to lock down your schema definition.

```js
const { Enum, Null, Fixed } = require('express-sql');

{
    ID: Fixed(Number, 6), // limits the ID to 6 digits
    PayType: Enum("Hourly", "Salary"),
    Name: Null(String)
}
```

### [API](API.md)