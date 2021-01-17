const express = require('express')
const cors = require('cors')
const gameRouter = require('./helpers/scrapper')

/* App Configuration */
const app = express()
const PORT = process.env.PORT || 8080

/* Middlewares */
app.use(cors())
app.use((req, res, next) => {
  try {
    next()
  } catch (err) {
    res.json({
      status: 500,
      error: err
    })
  }
})

/* Routes */
app.use('/check', gameRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log('Running on port', PORT)
})