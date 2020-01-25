const mysql = require("mysql")
const dbconfig = require("../config/database.js")
const connection = mysql.createConnection(dbconfig.connection)


connection.query("USE mydb;")



exports.addRestaurant = (restaurantName) => {
    let addRes = `INSERT INTO restaurants (name) VALUE (?)`;
    connection.query(addRes, [restaurantName],
        function (err, rows) {
            if (err) {
                throw err;
            }

        })

}

exports.editRestaurant = (id, name) => {
    connection.query("UPDATE restaurants SET name = ? WHERE restaurant_id = ?", 
    [name, id], (err, rows)  => {
        if(err){
           throw err;
        } 
    })
}