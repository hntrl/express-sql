
const express = require('express');
const eSQL = require('express-sql');

const app = express();
const port = 3000;

const conn = eSQL.Connection({
    socket: '/var/run/mysqld/mysqld.sock',
    username: 'timmy',
    password: 'letmein'
});

const Employee = require('./objects/employee');

app.use('/employees', conn.link(Employee));

app.listen(port);