
const express = require('express');
const errors = require('./errors');
const { Schema } = require('./schema');

const defaultPathBuilder = methods => ({
    post: methods.post,
    '(alias)': {
        get: methods.get,
        put: methods.put,
        delete: methods.delete
    }
})

class SQLObject {

    constructor(options) {

        if (!options.primaryKey) {
            throw new errors.ConfigError('Missing primary key');
        }

        this._tableName = options.table;
        if (!this._tableName) {
            throw new errors.ConfigError('Missing table name');
        }

        let defaultIdMake = () => Number((Math.random() * (999999 - 100000) + 100000).toFixed());
        this._makeID = options.makeID || defaultIdMake;

        this._schema = new Schema(options.schema, options.mapping);
        if (this._schema.object[options.primaryKey][1].isNullable) {
            throw new errors.ConfigError('Primary key cannot be null')
        }

        this.paths = options.path;

        this._primaryKey = options.primaryKey;
        this._sqlKey = this._schema.object[this._primaryKey][0]
        this._pathAlias = options.pathAlias || this._primaryKey;

        // TODO: this shouldnt be here
        // TODO: The current method lifecycle doesn't work well with query params
        this.methods = {
            post: this._middleware(({ body }, res, conn) => {
                body[this._primaryKey] = body[this._primaryKey] || this._makeID();
                this._schema.validate(body);
                let lists = this._schema.valueLists(body);
                let queryString = `INSERT INTO ${this._tableName} (${lists.col}) VALUES (${lists.val});`
                return conn.query(queryString, res).then(() => {
                    res.send(body);
                });
            }),
            get: this._middleware(({ body }, res, conn) => {
                this._schema.validateKey(this._primaryKey, body[this._primaryKey]);
                let queryString = `SELECT * FROM ${this._tableName} WHERE ${this.sqlPrimaryKey(body)} LIMIT 1;`;
                return conn.query(queryString, res).then(data => {
                    if (data[0].length) {
                        res.send(this._schema.convertToObject(data[0][0]))
                    } else {
                        res.status(404);
                        res.send({});
                    }
                })
            }),
            put: this._middleware(({ body }, res, conn) => {
                this._schema.validate(body, true)
                let queryString = `UPDATE ${this._tableName} SET ${this._schema.separatedList(body)} WHERE ${this.sqlPrimaryKey(body)};`
                return conn.query(queryString, res).then(data => {
                    if (data[0].affectedRows === 0) {
                        res.status(404);
                        res.send({})
                    } else {
                        res.send(body);
                    }
                });
            }),
            delete: this._middleware(({ body }, res, conn) => {
                console.log('delete');
                this._schema.validateKey(this._primaryKey, body[this._primaryKey]);
                let queryString = `DELETE FROM ${this._tableName} WHERE ${this.sqlPrimaryKey(body)}`;
                return conn.query(queryString, res).then(data => {
                    if (data[0].affectedRows === 0) {
                        res.status(404);
                        res.send({})
                    } else {
                        res.status(204);
                        res.send({});
                    }
                });
            }),
        }
    }

    _buildPaths() {
        if (this.paths) {
            if (this.paths instanceof Function) this.paths = this.paths(this.methods);
            else this.paths = this.paths;
        } else {
            this.paths = defaultPathBuilder(this.methods);
        }
    }

    sqlPrimaryKey(params) {
        return `${this._sqlKey}=${params[this._primaryKey]}`;
    } 

    _middleware(func) {
        return (req, res, conn) => {
            let params = {
                body: req.body || {},
                path: req.params,
                query: req.query
            }

            let pathVal = params.path[this._pathAlias];
            if (pathVal) {
                if (this._schema.object[this._primaryKey][1].is(Number)) {
                    pathVal = parseInt(pathVal);
                }
                params.body[this._primaryKey] = pathVal;
            }

            try {
                return func(params, res, conn);
            } catch (e) {
                if (e instanceof errors.ValidationError) {
                    res.status(400);
                    res.send({ error: 'ValidationError', msg: e.msg, keys: e.keys })
                } else {
                    res.status(500);
                    throw e;
                }
            }
        }
    }

    defineMethod(key, func) {
        this.methods[key] = this._middleware(func)
    }

    use() {
        let router = express.Router();
        let map = (a, route) => {
            for (var key in a) {
                route = route.replace('(alias)', `:${this._pathAlias}`);
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
        this._buildPaths();
        map(this.paths, '/');
        return router;
    }
}

module.exports = { Object: SQLObject }