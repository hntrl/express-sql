
const bindings = [
    [String, "VARCHAR"],
    [Number, "INT"],
    [Boolean, "BOOL"]
];

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

    is(type) {
        return type.name == this.literal.name
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
    _Type,
    Fixed,
    Enum,
    Null
}