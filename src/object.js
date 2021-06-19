
const errors = require('./errors');
const { Schema } = require('./schema');

class SQLObject {

    static _pathBuilder = methods => ({
        post: methods.post,
        '(alias)': {
            get: methods.get,
            put: methods.put,
            delete: methods.delete
        }
    })

    constructor(options) {

        this._primaryKey = options.primaryKey;
        if (!this._primaryKey) {
            throw new errors.ConfigError('Missing primary key');
        }

        this._schema = new Schema(options.schema, options.mapping);
        if (this._schema.object[this._primaryKey][1].isNullable) {
            throw new errors.ConfigError('Primary key cannot be null')
        }

        this._pathAlias = options.pathAlias || this._primaryKey;
    }

    buildPaths() {
        if (options.paths) {
            if (options.paths instanceof Function) this.paths = options.paths(this.methods);
            else this.paths = options.paths;
        } else {
            this.paths = SQLObject._pathBuilder(this.methods);
        }
    }

    _middleware(func) {
        return (req, res, conn) => {
            req.body = req.body || {};

            var pathVal = req.params[this._pathAlias];
            if (pathVal) {
                req.body[this._primaryKey] = pathVal;
            }

            return func(req.body, res, conn);
        }
    }

    // TODO: implement functions
    methods = {
        post: this._middleware(function (params, res, conn) {
            this._schema.validate(params);
        }),
        get: this._middleware(function (params, res, conn) {
            this._schema.validateKey(this._primaryKey, params[this._primaryKey]);
        }),
        update: this._middleware(function (params, res, conn) {
            this._schema.validate(params, [this._primaryKey])
        }),
        delete: this._middleware(function (req, res, conn) {
            this._schema.validateKey(this._primaryKey, params[this._primaryKey]);
        }),
    }
}

module.exports = { Object: SQLObject }