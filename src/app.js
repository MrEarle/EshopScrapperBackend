const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const orm = require('./models')
const routes = require('./routes')



/* App Configuration */
const app = express()
const PORT = process.env.PORT || 8080
const developmentMode = app.env === 'development';


/* Middlewares */
app.use(function (err, req, res, next) {
  let responseData;

  if (err.name === 'JsonSchemaValidation') {
    // Log the error however you please
    console.log(err.message);
    // logs "express-jsonschema: Invalid data found"

    // Set a bad request http response status or whatever you want
    res.status(400);

    // Format the response body however you want
    responseData = {
      statusText: 'Bad Request',
      jsonSchemaValidation: true,
      validations: err.validations  // All of your validation information
    };

    // Take into account the content type if your app serves various content types
    if (req.xhr || req.get('Content-Type') === 'application/json') {
      res.json(responseData);
    } else {
      // If this is an html request then you should probably have
      // some type of Bad Request html template to respond with
      res.render('badrequestTemplate', responseData);
    }
  } else {
    // pass error to next error middleware handler
    next(err);
  }
});
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
Object.entries(routes).forEach(([route, router]) => app.use(route, router))

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app