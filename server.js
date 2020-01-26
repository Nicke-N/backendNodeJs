const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const app = express()
const port = process.env.PORT || 3000;
const ip = process.env.IP || "localhost";
const path = require("path")
const passport = require("passport")
const flash = require("connect-flash")

require("./config/passport")(passport)

app.use(morgan("dev"))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended : true
}))
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs")
app.use(session({
    secret : "hehe",
    resave : true,
    saveUninitialized : true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

require("./app/routes.js")(app, passport)

app.listen(port, ip, () => {
    console.log("port: " + port)
})

