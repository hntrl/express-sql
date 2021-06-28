
const mysql = require('mysql2');

module.exports = function(options) {
    
    let opts = options || {};
    this.sql = mysql.createConnection(opts);

    this.query = async function query(queryString) {
        return new Promise((pass, fail) => 
            this.sql.query(queryString, function(err, results) {
                if (err) {
                    res.status(500).send({ msg: 'A SQL error occured' });
                    fail(err);
                }
                pass(results);
            })
        )
    }

    return (req, _, next) => {
        req.conn = this;
        next();
    }
}