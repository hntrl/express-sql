
const errors = require('./errors');

const bindings = [
    [String, "VARCHAR"],
    [Number, "INT"],
    [Boolean, "BOOL"]
];

class Schema {

    constructor(object, mapping = {}) {

        this.object = {};

        // Build schema object from parameters
        var _objectEntries = Object.entries(object);
        var _mappingEntries = Object.entries(mapping);

        _objectEntries.forEach(entry => {

            var [entKey, entVal] = entry;
            var key = entKey;
            var val = entVal;

            if (!Array.isArray(val)) {
                var mapping = _mappingEntries.find(item => item[1] === entKey);
                key = mapping ? mapping[0] : entKey;
                val = [entKey, entVal];
            }

            if (!_Type.isSupported(val[1])) {
                throw new errors.SchemaError(`Unsupported type ${val.name} for ${key}`, this);
            } else {
                this.object[key] = [val[0], _Type.from(val[1])]
            }
        });
    }

    validate(object) {

        var objectKeys = Object.keys(object);
        var thisKeys = Object.keys(this.object);
        var thisNullableKeys = thisKeys.filter(key => this.object[key][1].isNullable);
        var thisRequiredKeys = thisKeys.filter(key => !thisNullableKeys.includes(key));

        // fails: this[1, 2, 3] object[1, 2, 3, 4]
        var extraneous = objectKeys.filter(key => !thisKeys.includes(key));
        if (extraneous.length) {
            throw new errors.ValidationError(`Keys ${extraneous.join()} are not permitted`);
        }

        // fails: this[1, 2, 3] object[1, 2, 3(NULL)]
        // passes: this[1, 2(NULL), 3] object[1, 2, 3]
        var nullKeys = Object.entries(object).map(entry => entry[1] === null ? entry[0] : false).filter(a => a);
        var problemNullKeys = nullKeys.filter(a => !thisNullableKeys.includes(a));
        if (problemNullKeys.length) {
            throw new errors.ValidationError(`Keys ${problemNullKeys.join()} cannot be null`)
        }

        // fails: this[1, 2, 3] object[1, 2]
        // passes: this[1, 2, 3(NULL)] object[1, 2]
        var missing = thisRequiredKeys.filter(key => !objectKeys.includes(key));
        if (missing.length) {
            throw new errors.ValidationError(`Missing keys ${missing.join()}`);
        }

        var problems = Object.entries(object).map(entry => {
            var [key, val] = entry;
            if (!this.object[key][1].check(val)) return key
            return false;
        }).filter(a => a);

        if (problems.length) {
            throw new errors.ValidationError(`Keys ${problems.join()} failed validation`);
        }

        return true;
    }

    validateKey(key, val) {
        if (!this.object[key][1].check(val)) {
            throw new errors.ValidationError(`Keys ${key} failed validation`)
        }
        return true;
    }
    key(key) {
        return this.object[key][1];
    }
}

class _Type {

    static from(type) {
        if (type instanceof _Type) {
            return type;
        } else {
            var obj = new _Type();
            obj.literal = type;
            return obj;
        }
    }

    static isSupported(type) {
        let supported = bindings.map(bind => bind[0]);

        if (type instanceof _Type) {
            return true;
        } else if (supported.find(item => item === type)) {
            return true;
        }
        return false;
    }

    // TODO: find a way to compare object literals rather then using constructor names
    check(value) {
        if ((value === null || value === undefined) && this.isNullable) return true;
        if (this.length && (String(value).length !== this.length)) return false;
        if (Array.isArray(this.allowed)) {
            return this.allowed.includes(value);
        } else {
            return value.constructor.name === this.literal.name;
        }
    }
}

let Fixed = function(type, length) {
    type = _Type.from(type);
    type.length = length;
    return type;
}.bind(_Type);

// TODO: Should multiple types be accepted for enum?
let Enum = function(...options) {
    var type = new _Type();
    type.literal = typeof options[0];
    type.allowed = options;
    return type;
}.bind(_Type);

let Null = function(type) {
    type = _Type.from(type);
    type.isNullable = true;
    return type;
}.bind(_Type);

module.exports = {
    Schema,
    Fixed,
    Enum,
    Null
}