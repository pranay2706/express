
const { Pool } = require('pg')
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

function connectSQLDB() {
    pool.connect(function (err) {
        if (err) throw err;
        console.log("Database Connected successfully!");
    });
}

module.exports = { connectSQLDB, pool }