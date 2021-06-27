
const mysql = require('mysql2');

let proto = module.exports = function(options) {
    
    let opts = options || {};
    this.sql = mysql.createConnection(opts);

    return (req, _, next) => {
        req.conn = this;
        next();
    }
}

proto.query = async function query(queryString) {
    return this.sql.query(queryString, function(err, results, fields) {
        if (err) {
            res.status(500);
            res.send({ msg: 'A SQL error occured' });
            throw err;
        }
        return results;
    });
}