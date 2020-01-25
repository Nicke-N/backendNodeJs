const mainJs = require("../public/main.js")
const mysql = require("mysql")
const dbconfig = require("../config/database.js")
const connection = mysql.createConnection(dbconfig.connection)


connection.query("USE mydb;")

module.exports = function (app, passport) {
    app.get("/addrestaurant", isLoggedIn, (req, res) => {
        res.render("addrestaurant.ejs")
    })

    app.get("/", (req, res) => {
        res.render("login.ejs", { message: req.flash("loginMessage") })
    })

    app.post("/", passport.authenticate("local-login", {
        successRedirect: "/profile",
        failureRedirect: "/",
        failureFlash: true
    }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect("/")
        })

    app.get("/register", (req, res) => {
        res.render("register.ejs", { message: req.flash("signupMessage") })
    })

    app.post("/register", passport.authenticate("local-signup", {
        successRedirect: "/profile",
        failureRedirect: "/register",
        failureFlash: true
    }))

    app.get("/profile", isLoggedIn, (req, res) => {
        let allRestaurants = "SELECT * FROM restaurants";
        connection.query(allRestaurants, (err, rows) => {
            if (err) {
                throw err;
            }

            res.render("profile.ejs", {
                user: req.user,
                restaurants: rows
            })

        })
    })
    app.post("/addrestaurant", (req, res) => {
        let addRes = `INSERT INTO restaurants (name) VALUE (?)`;
        connection.query(addRes, [req.body.restaurant],
            function (err, rows) {
                if (err) {
                    throw err;
                }
                res.redirect("/profile")
            })

    })

    app.post("/restaurant/:id", (req, res) => {
        
        if(req.body.button == "update") {
            connection.query("UPDATE restaurants SET name = ? WHERE restaurant_id = ?",
            [req.body.name, req.body.id], (err, rows) => {
                if (err) {
                    throw err;
                }
                res.redirect("/profile");
            })
        } else if(req.body.button == "delete"){
            connection.query("DELETE FROM restaurants WHERE restaurant_id = ?", [req.body.id], (err, rows) => {
                if (!err) {
                    res.redirect("/profile")
                } 
            })
        }
        

    })
    app.get("/restaurant/:id", isLoggedIn, (req, res) => {
        let restaurantInfo = 
        "SELECT r.restaurant_id, r.name, re.rating, re.comment, u.username, " +
        "(SELECT TRUNCATE(sum(rating)/count(rating),1) AS average FROM review WHERE restaurant_id = ?) AS average " +
        "FROM review re " +
        "JOIN restaurants r ON r.restaurant_id = re.restaurant_id " +
        "JOIN users u ON u.user_id = re.user_id " +
        "WHERE r.restaurant_id = ?"
        connection.query(restaurantInfo, [req.params.id, req.params.id], (err, rows) => {
            console.log("user.user_id" +req.user.user_id + "params.id" +req.params.id)
            if (!err) {
                res.render("aRestaurant.ejs", {
                    restaurant: rows
                })
            } else {
                
                throw err;
            }
        })
    })

    app.get("/review/:id", isLoggedIn, (req, res) => {
        connection.query("SELECT * FROM restaurants WHERE restaurant_id = ?", [req.params.id], (err, rows) => {
            if (!err) {
                res.render("review.ejs", {
                    restaurant: rows,
                    user: req.user
                })
            } else {
                res.send("failed")
            }
        })
    })
    app.post("/review/:id", isLoggedIn, (req, res) => {
        let db = req.body;
        connection.query("INSERT INTO review (restaurant_id, user_id, rating, comment) VALUES (?,?,?,?)", 
        [db.restaurantId, db.userId, db.rate, db.comment], (err, rows) => {
            if (!err) {
                res.redirect("/profile")
            } else {
                res.send("failed")
            }
        })
    })


    app.get("/logout", (req, res) => {
        req.logout()
        res.redirect("/login")
    })
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/")
}

