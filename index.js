if (process.env.NODE_ENV !== 'production') require('dotenv').config()

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
  req.ctx.orm = orm
})

app.use(cors())
app.use((err, req, res, next) => {
  res.json({
    status: 500,
    error: err,
  })
})

/* Routes */
app.use('/check', gameRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log('Running on port', PORT)
})
