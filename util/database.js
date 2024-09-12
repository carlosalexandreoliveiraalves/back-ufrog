/*const mysql = require("mysql2");

const config = require('../config/config.json')

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password,

})
*/

// Promissificando métodos do pool de conexões

//module.exports = pool.promise;

const mysql = require("mysql2");
const { promisify } = require("util");
const config = require('../config/config.json')

const pool = mysql.createPool({
    host: process.env.MYSQLHOST, 
    port: process.env.MYSQLPORT,  
    user: process.env.MYSQL_USER,  
    database: process.env.MYSQL_DATABASE, 
    password: process.env.MYSQL_ROOT_PASSWORD  
});


// Promissificando os métodos do pool de conexões
pool.query = promisify(pool.query);
pool.execute = promisify(pool.execute);

module.exports = pool;
