
const mysql = require('mysql2/promise');

module.exports = function(options) {

    let opts = options || {};
    let keepAliveTimeout = opts.keepAlive;
    delete opts.keepAlive;

    this.sql = mysql.createConnection(opts);

    this.query = async function query(queryString) {
        let sql = await this.sql;
        return (await sql.execute(queryString))[0];
    }

    if (keepAliveTimeout) {
      let keepAlive = () => this.query('SELECT 1');
      setInterval(keepAlive, keepAliveTimeout)
    }

    return (req, _, next) => {
        req.conn = this;
        next();
    }
}