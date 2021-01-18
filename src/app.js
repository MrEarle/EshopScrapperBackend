const express = require('express')
const cors = require('cors')
const orm = require('./models')
const gameRouter = require('./routes/checkGame')



/* App Configuration */
const app = express()
const PORT = process.env.PORT || 8080
const developmentMode = app.env === 'development';


/* Middlewares */

// add ORM to context
app.use((req, res, next) => {
  req.ctx = { orm }
  next()
})

app.use(cors())

/* Routes */
app.use('/check', gameRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app