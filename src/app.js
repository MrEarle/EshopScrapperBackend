const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('express-jwt')
const orm = require('./models')
const routes = require('./routes')

/* App Configuration */
const app = express()

/* Middlewares */
app.use((err, req, res, next) => {
  let responseData
  console.log(err.message)

  if (err.name === 'JsonSchemaValidation') {
    // Log the error however you please
    console.log(err.message)
    // logs "express-jsonschema: Invalid data found"

    // Set a bad request http response status or whatever you want
    res.status(400)

    // Format the response body however you want
    responseData = {
      statusText: 'Bad Request',
      jsonSchemaValidation: true,
      validations: err.validations, // All of your validation information
    }

    // Take into account the content type if your app serves various content types
    if (req.xhr || req.get('Content-Type') === 'application/json') {
      res.json(responseData)
    } else {
      // If this is an html request then you should probably have
      // some type of Bad Request html template to respond with
      res.render('badrequestTemplate', responseData)
    }
  } else {
    // pass error to next error middleware handler
    next(err)
  }
})
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// add ORM to context
app.use((req, res, next) => {
  req.ctx = { orm }
  next()
})

app.use(cors())

/* Routes */
Object.entries(routes.free).forEach(([route, router]) => app.use(route, router))

const authedRouter = express.Router()
// JWT authentication without passthrough (error if not authenticated)
authedRouter.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }))
authedRouter.use(async (req, res, next) => {
  if (req.user.userId) {
    req.user = await req.ctx.orm.User.findByPk(req.user.userId)
  }
  return next()
})

Object.entries(routes.authed).forEach(([route, router]) => {
  authedRouter.use(route, router)
})

app.use('/authed', authedRouter)

module.exports = app
