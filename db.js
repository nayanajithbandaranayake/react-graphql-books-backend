const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: "b3z4w7xv78kebuyoml4e-mysql.services.clever-cloud.com",
  user: "ukvawrljlznxfhyn",
  password: "vysk8kN4E5kQLc8wH4MX",
  database: "b3z4w7xv78kebuyoml4e",
});

dbConnection.connect((err) => {
  if (err) console.log(err);
  console.log("database connected.");
});

module.exports = dbConnection;
