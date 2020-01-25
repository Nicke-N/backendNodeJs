const LocalStrategy = require("passport-local").Strategy
const mysql = require("mysql")
const bcrypt = require("bcrypt-nodejs")
const dbconfig = require("./database.js")
const connection = mysql.createConnection(dbconfig.connection)

connection.query("USE mydb;")

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user.user_id)
    })

    passport.deserializeUser((user_id, done) => {
        connection.query("SELECT * FROM users WHERE user_id = ?",
            [user_id], (err, rows) => {
                done(err, rows[0])
            })
    })

    passport.use(
        "local-signup",
        new LocalStrategy({
                usernameField: "username",
                passwordField: "password",
                passReqToCallback: true
            },
            function(req, username, password, done)  {
                connection.query("SELECT * FROM users WHERE username = ?",
                    [username], function(err, rows) {
                        if (err) {
                            return done(err)
                        }
                        if (rows.length) {
                            return done(null, false, req.flash("signupMessage", "Username already in use!"))
                        } else { 
                            let newUser = {
                                username: username,
                                password: bcrypt.hashSync(password, null, null)
                            }

                            let insert = "INSERT INTO users (username, password) VALUES (?,?)";

                            connection.query(insert, [newUser.username, newUser.password],
                                function(err, rows)  {
                                    newUser.user_id = rows.insertId;
                                    return done(null, newUser)
                                })
                                
                        }
                    })
            }

        )
    )

    passport.use(
        "local-login",
        new LocalStrategy({
                usernameField: "username",
                passwordField: "password",
                passReqToCallback: true
            },
            function (req, username, password, done) {
                connection.query("SELECT * FROM users WHERE username = ? ", [username],
                    function (err, rows) {
                        if (err) {
                            return done(err);
                        }
                        if (!rows.length) {
                            return done(null, false, req.flash("loginMessage", "User doesn't exist!"))
                        }
                        if (!bcrypt.compareSync(password, rows[0].password)) {
                            return done(null, false, req.flash("loginMessage", "Password is incorrect!"))
                        }
                        return done(null, rows[0])
                    })
            })
    )
}