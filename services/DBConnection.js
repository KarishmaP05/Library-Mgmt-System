var mysql = require('mysql2');
require('dotenv').config();

var Connector = () => {

    var con = mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "admin",
        database: "libsys"
    });
    con.connect((error) => {
        if (error) {
            console.error('Error connecting to MySQL database:', error);
        } else {
            console.log('Connected to MySQL database!');
        }
    });
    return con
}

module.exports = {
    Connector: Connector
}