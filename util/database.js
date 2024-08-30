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
    host: config.host,
    port: config.port || 3306,
    user: config.user,
    database: config.database,
    password: config.password
});

// Promissificando os métodos do pool de conexões
pool.query = promisify(pool.query);
pool.execute = promisify(pool.execute);

module.exports = pool;
