
class ConfigError {

}

class SchemaError extends ConfigError {

}

class ValidationError {
    constructor(msg, keys) {
        this.msg = msg;
        this.keys = keys;
    }
}

module.exports = {
    ConfigError,
    SchemaError,
    ValidationError
}