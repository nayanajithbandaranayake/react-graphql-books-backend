const mysql = require("mysql");
require("dotenv").config();

const dbConnection = mysql.createPool({
  connectionLimit: 5,
  host: process.env.NODE_MYSQL_HOST,
  user: process.env.NODE_MYSQL_USER,
  password: process.env.NODE_MYSQL_PASSWORD,
  database: process.env.NODE_MYSQL_DATABASE,
});

module.exports = dbConnection;
