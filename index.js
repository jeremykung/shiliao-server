// 🟢 Imports
import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"

// below 3 lines gets path to directory
import { dirname } from "path"
import { fileURLToPath } from "url"
const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const port = 3000
let fullString = ''

// 🟢 Custom Middleware
function logger(req, res, next) {
    console.log('Request Method:', req.method)
    console.log('Request URL:', req.url)
    next()
}
function stringJoiner(req, res, next) {
    console.log(req.body)
    fullString = req.body.amount + req.body.food
    next()
}

// 🟢 Mount Middleware
app.use(logger)
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(stringJoiner)

// 🟢 Endpoints

app.get("/", (req, res) => {
    console.log('req headers:', req.rawHeaders)
    res.sendFile(__dirname + "/public/index.html")
})

app.get("/about", (req, res) => {
    res.send("<h1>About App</h1><p>Hot and cold foods search</p>")
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html")
})

app.post("/login", (req, res) => {
    console.log(req.body)
    console.log('fullString:', fullString)
    res.status(200).send("user loggged in")
})

app.post("/submit", (req, res) => {
    console.log(req.body)
    res.status(201).send(`<h1>Full String:${fullString}</h1>`)
})

app.listen(port, () => {
    console.log("Server running on port 3000.")
    console.log('index dir:', __dirname)
})