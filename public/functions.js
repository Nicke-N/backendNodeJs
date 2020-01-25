const mysql = require("mysql")
const dbconfig = require("../config/database.js")
const connection = mysql.createConnection(dbconfig.connection)


connection.query("USE mydb;")

