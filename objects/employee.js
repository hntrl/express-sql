
const eSQL, { Fixed, Enum } = require('express-sql');

var Employee = new eSQL.Object({

    // depending on the schema type
    primaryKey: 'id',
    primaryKey: 'EmployeeID',

    // /:employeeId
    pathObjectAlias: 'employeeId',

    schema: {
        id: ['EmployeeID', Fixed(Number, 6)],
        store: ['StoreID', Fixed(Number, 2)],
        role: ['Role', Number],
        first: ['FirstName', String],
        last: ['LastName', String],
        pay_type: ['PayType', Enum("Hourly", "Salary")],
        tippable: ['Tippable', Boolean]
    }

});

module.exports = Employee;