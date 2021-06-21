
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

        this._primaryKey = options.primaryKey;
        this._sqlKey = this._schema.object[this._primaryKey][0]
        this._pathAlias = options.pathAlias || this._primaryKey;

        if (options.paths) {
            if (options.paths instanceof Function) this.paths = options.paths(this.methods);
            else this.paths = options.paths;
        } else {
            this.paths = defaultPathBuilder(this.methods);
        }
    }

    sqlPrimaryKey(params) {
        return `${this._sqlKey}=${params[this._primaryKey]}`;
    } 

    _middleware(func) {
        return (req, res, conn) => {
            req.body = req.body || {};
            var pathVal = req.params[this._pathAlias];
            if (pathVal) {
                if (this._schema.object[this._primaryKey][1].is(Number)) {
                    pathVal = parseInt(pathVal);
                }
                req.body[this._primaryKey] = pathVal;
            }
            try {
                return func(req.body, res, conn);
            } catch (e) {
                if (e instanceof errors.ValidationError) {
                    res.status(400);
                    res.send({ error: 'ValidationError', msg: e.msg, keys: e.keys })
                } else {
                    res.send(500);
                    throw e;
                }
            }
        }
    }

    get methods() {
        return {
            post: this._middleware((params, res, conn) => {
                params[this._primaryKey] = params[this._primaryKey] || this._makeID();
                this._schema.validate(params);
                let lists = this._schema.valueLists(params);
                let queryString = `INSERT INTO ${this._tableName} (${lists.col}) VALUES (${lists.val});`
                return conn.query(queryString, res).then(() => {
                    res.send(params);
                });
            }),
            get: this._middleware((params, res, conn) => {
                this._schema.validateKey(this._primaryKey, params[this._primaryKey]);
                let queryString = `SELECT * FROM ${this._tableName} WHERE ${this.sqlPrimaryKey(params)} LIMIT 1;`;
                return conn.query(queryString, res).then(data => {
                    if (data[0].length) {
                        res.send(this._schema.convertToObject(data[0][0]))
                    } else {
                        res.status(404);
                        res.send({});
                    }
                })
            }),
            put: this._middleware((params, res, conn) => {
                this._schema.validate(params, true)
                let queryString = `UPDATE ${this._tableName} SET ${this._schema.separatedList(params)} WHERE ${this.sqlPrimaryKey(params)};`
                return conn.query(queryString, res).then(data => {
                    if (data[0].affectedRows === 0) {
                        res.status(404);
                        res.send({})
                    } else {
                        res.send(params);
                    }
                });
            }),
            delete: this._middleware((params, res, conn) => {
                console.log('delete');
                this._schema.validateKey(this._primaryKey, params[this._primaryKey]);
                let queryString = `DELETE FROM ${this._tableName} WHERE ${this.sqlPrimaryKey(params)}`;
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
}

module.exports = { Object: SQLObject }