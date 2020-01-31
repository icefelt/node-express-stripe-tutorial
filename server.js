const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

/* Init */
const app = express()
app.use(express.json())
app.use(cors())

dotenv.config()

// Mongoose settings to surpress warnings
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true)
mongoose.set("useFindAndModify", false)
console.log(`Connected to DB.`)

// Set port for Heroku
const port = process.env.PORT || 5000
app.listen(port)

/* Routes */
app.use("/api/auth/", require("./routes/auth/signup"))
app.use("/api/auth/", require("./routes/auth/login"))
app.use("/api/auth/", require("./routes/auth/password"))
app.use("/api/auth/", require("./routes/auth/whoami"))

console.log(`Port no: ${port}.`)
console.log("Ready to rock!")
