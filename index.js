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

app.get("/temperature/:temperature", (req, res) => {
    const temperature = req.params.temperature
    db.query(`SELECT * FROM food WHERE temperature='${temperature}'`, (err, dbRes) => {
        if (err) {
            console.log("DB error:", err)
            res.send(`Error searching for food type: ${temperature}`)
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
        temperature: req.body.temperature.toLowerCase()
    }
    try {
        const query = `INSERT INTO food (name, type, temperature) VALUES ('${foodData.name}', '${foodData.type}', '${foodData.temperature}')`
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

// Learn how to do patch request on express
// currently can't read req body

app.patch("/patch/:id", async (req, res) => {
    console.log('req data:', req.body)
    const query = `UPDATE food SET name = '${req.body.name}', type = '${req.body.type}', temperature = '${req.body.temperature}' WHERE id = ${req.body.id}`
    try {
        const result = await db.query(query, (err, response) => {
            if (err) {
                console.log('DB error updating:', err)
                res.send({ message: 'error updating' })
            } else {
                console.log(response)
                res.status(200).send({ message: 'update successful' })
            }
        })
    } catch (error) {
        console.log('error updating:', error)
    }
})


app.listen(port, () => {
    console.log("Server running on port 3000.")
    console.log('index dir:', __dirname)
})