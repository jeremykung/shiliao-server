// 🟢 Imports
import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
import pg from "pg"
import cors from "cors"

import { dirname } from "path"
import { fileURLToPath } from "url"

// 🟢 Setup
const app = express()
const port = 3000

const __dirname = dirname(fileURLToPath(import.meta.url))

const corsOptions = {
    origin: "http://localhost:8000"
}

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "shiliao",
    password: "p0stGres",
    port: 5432
})

try {
    const conn = await db.connect();
    console.log("DB Connection Successful")

    db.query("SELECT * FROM food", (err, res) => {
        if (err) {
            console.log("DB error:", err)
        } else {
            console.log("DB Food Table:", res.rows)
        }
    })

} catch (error) {
    console.log('DB Connection Error:', error)    
}

// 🟢 Mount Middleware
app.use(morgan("dev"))
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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

app.get("/all", (req, res) => {
    let data = []
    const query = "SELECT * FROM food"
    db.query(query, (err, dbRes) => {
        if (err) {
            console.log("DB Error:", err)
        } else {
            console.log("All Foods Data:", dbRes.rows)
            res.status(200).send(dbRes.rows)
        }
    })
})

app.get("/property/:property", (req, res) => {
    const property = req.params.property
    db.query(`SELECT * FROM food WHERE property='${property}'`, (err, dbRes) => {
        if (err) {
            console.log("DB error:", err)
            res.send(`Error searching for food type: ${property}`)
        } else {
            console.log("DB Food Table:", dbRes.rows)
            res.send(dbRes.rows)
        }
    })
})

app.post("/add", async (req, response) => {
    console.log("add food data:", req.body)
    const foodData = {
        name: req.body.name.toLowerCase(),
        type: req.body.type.toLowerCase(),
        property: req.body.property.toLowerCase()
    }
    try {
        const query = `INSERT INTO food (name, type, property) VALUES ('${foodData.name}', '${foodData.type}', '${foodData.property}')`
        console.log("query:", query)
        await db.query(query, (err, res) => {
            if (err) {
                console.log("DB error:", err)
                if (err.code === '23505') {
                    response.status(409).send("Food already exists")
                } else {
                    response.status(500).send("Error adding food")
                }
                // Disallow Duplicate Named Foods (case insensitive)    
                // Check DB restrictions
                // Return Error
                // Error message on frontend
            } else {
                console.log("successful insertion:", res)
                response.send(res)
            }
        })
    } catch (error) {
        console.log('error adding food:', error)
    }

})


app.listen(port, () => {
    console.log("Server running on port 3000.")
    console.log('index dir:', __dirname)
})