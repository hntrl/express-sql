
const express = require('express');
const mysql = require('mysql2');

class Connection {

    constructor(options) {
        this.options = options;
        this.sql = mysql.createConnection(this.options);
    }

    query(queryString, res) {
        return new Promise((pass, fail) => {
            return this.sql.query(queryString, function(err, results, fields) {
                // TODO: better error handling
                if (err) {
                    res.status(400);
                    res.send(err);
                    fail(err);
                    return;
                }
                pass([results, fields]);
            })
        });
    }

    link(object) {
        let router = express.Router();
        let map = (a, route) => {
            for (var key in a) {
                route = route.replace('(alias)', `:${object._pathAlias}`);
                switch (typeof a[key]) {
                    // { '/path': { ... }}
                    case 'object':
                        map(a[key], route + key);
                        break;
                    // get: function(){ ... }
                    case 'function':
                        let func = a[key];
                        router[key](route, (rq, rs) => func(rq, rs, this))
                        break;
                }
            }
        }
        map(object.paths, '/');
        return router;
    }
}

module.exports = { Connection };