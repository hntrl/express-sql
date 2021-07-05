
const mysql = require('mysql2/promise');

module.exports = function(options) {
    
    let opts = options || {};
    this.sql = mysql.createConnection(opts);

    this.query = async function query(queryString, _retry = 1) {
        let sql = await this.sql;
        return sql.ping()
          .then(async () => {
            let [results, fields] = await sql.execute(queryString);
            return results;
          })
          .catch(() => {
            if (_retry > 3) {
              this.sql = mysql.createConnection(opts);
              this.query(queryString, _retry + 1)
            } else {
              throw new Error('MYSQL failed to reconnect');
            }
          })
    }

    return (req, _, next) => {
        req.conn = this;
        next();
    }
}