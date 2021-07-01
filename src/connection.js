
const mysql = require('mysql2/promise');

module.exports = function(options) {
    
    let opts = options || {};
    this.sql = mysql.createConnection(opts);

    this.query = async function query(queryString) {
        let sql = await this.sql;
        return (await sql.execute(queryString))[0];
    }

    return (req, _, next) => {
        req.conn = this;
        next();
    }
}