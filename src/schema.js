
const errors = require('./errors');
const { _Type } = require('./types');

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

    validate(object, allowMissing) {

        var objectKeys = Object.keys(object);
        var thisKeys = Object.keys(this.object);
        var thisNullableKeys = thisKeys.filter(key => this.object[key][1].isNullable);
        var thisRequiredKeys = thisKeys.filter(key => !thisNullableKeys.includes(key));

        // fails: this[1, 2, 3] object[1, 2, 3, 4]
        var extraneous = objectKeys.filter(key => !thisKeys.includes(key));
        if (extraneous.length) {
            throw new errors.ValidationError(`Keys ${extraneous.join()} are not permitted`, extraneous);
        }

        // fails: this[1, 2, 3] object[1, 2, 3(NULL)]
        // passes: this[1, 2(NULL), 3] object[1, 2, 3]
        var nullKeys = Object.entries(object).map(entry => entry[1] === null ? entry[0] : false).filter(a => a);
        var problemNullKeys = nullKeys.filter(a => !thisNullableKeys.includes(a));
        if (problemNullKeys.length) {
            throw new errors.ValidationError(`Keys ${problemNullKeys.join()} cannot be null`, problemNullKeys)
        }

        if (!allowMissing) {
            // fails: this[1, 2, 3] object[1, 2]
            // passes: this[1, 2, 3(NULL)] object[1, 2]
            var missing = thisRequiredKeys.filter(key => !objectKeys.includes(key));
            if (missing.length) {
                throw new errors.ValidationError(`Missing keys ${missing.join()}`, missing);
            }
        }

        var problems = Object.entries(object).map(entry => {
            var [key, val] = entry;
            if (!this.object[key][1].check(val)) return key
            return false;
        }).filter(a => a);

        if (problems.length) {
            throw new errors.ValidationError(`Keys ${problems.join()} failed validation`, problems);
        }

        return true;
    }

    validateKey(key, val) {
        if (!this.object[key][1].check(val)) {
            throw new errors.ValidationError(`Keys ${key} failed validation`, [key])
        }
        return true;
    }
    key(key) {
        return this.object[key][1];
    }

    // TODO: these could maybe be reduced?
    convertToObject(sql) {
        let thisObjectEntries = Object.entries(this.object);
        let convertedSQL = Object.entries(sql).map(field => {
            let objectRef = thisObjectEntries.find(entry => entry[1][0] == field[0]);
            if (!objectRef) {
                throw new errors.ValidationError(`Unknown key ${field[0]}`);
            }
            return [objectRef[0], field[1]];
        });
        return Object.fromEntries(convertedSQL);
    }
    convertToSQL(obj) {
        let thisObjectEntries = Object.entries(this.object);
        let convertedObject = Object.entries(obj).map(field => {
            let objectRef = thisObjectEntries.find(entry => entry[0] == field[0]);
            if (!objectRef) {
                throw new errors.ValidationError(`Unknown key ${field[0]}`);
            }
            return [objectRef[1][0], field[1]]
        });
        return Object.fromEntries(convertedObject);
    }
    
    valueLists(data) {
        let entries = Object.entries(this.convertToSQL(data));
        return {
            col: entries.map(item => `\`${item[0]}\``).join(),
            val: entries.map(item => typeof item[1] == 'string' ? `"${item[1]}"` : item[1]).join()
        }
    }
    columnList() {
        return Object.values(this.object).map(item => `\`${item[0]}\``).join();
    }
    valueList(data) {
        return Object.values(data).map(item => typeof item == 'string' ? `"${item}"` : item).join();
    }
    separatedList(data) {
        return Object.entries(this.convertToSQL(data)).map(entry => {
            let [key, val] = entry;
            let stringValue = typeof val == 'string' ? `"${val}"` : val;
            return `\`${key}\`=${stringValue}`;
        }).join();
    }
}

module.exports = { Schema }