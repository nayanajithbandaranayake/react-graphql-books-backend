const mysql = require("mysql");
require("dotenv").config();

const dbConnection = mysql.createConnection({
  host: process.env.NODE_MYSQL_HOST,
  user: process.env.NODE_MYSQL_USER,
  password: process.env.NODE_MYSQL_PASSWORD,
  database: process.env.NODE_MYSQL_DATABASE,
});

dbConnection.connect((err) => {
  if (err) console.log(err);
  console.log("database connected.");
});

module.exports = dbConnection;
