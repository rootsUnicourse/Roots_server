import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import userRoutes from './routes/users.js'
import companyRoutes from './routes/companys.js'
// import googleUserRoutes from './routes/googleUser.js'

const app = express()

app.use(bodyParser.json({ limit: "30mb", extended: true})) // req.body
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}))
app.use(cors())

app.use('/user', userRoutes)
app.use('/companys', companyRoutes)
app.get('/', (req, res) => {
    res.send("APP IS RUNNING")
})

const CONNECTION_URL = "mongodb+srv://danel:danel@cluster0.ek9pq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" //the url to connect the database
const PORT = process.env.PORT || 5001 //the port the server working on

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
.catch((error) => console.log(error))