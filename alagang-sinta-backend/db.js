const mysql = require('mysql2/promise')

const mysqlPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'infoman',
  database: 'alagang_sinta'
})

module.exports = mysqlPool