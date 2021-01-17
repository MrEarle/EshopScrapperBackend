const express = require('express')
const cors = require('cors')
const gameRouter = require('./helpers/scrapper')

/* App Configuration */
const app = express()
const PORT = 3000

/* Middlewares */
app.use(cors())

/* Routes */
app.use('/check', gameRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log('Running')
})