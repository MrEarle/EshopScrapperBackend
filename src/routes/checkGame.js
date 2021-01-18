const express = require('express')
const { checkGame } = require('../helpers/scrapper')
const { validate } = require('express-jsonschema')

const checkSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      required: true,
    },
  },
}

const gameRouter = express.Router()

gameRouter.get(
  '/',
  validate({ query: checkSchema }),
  async (req, res, next) => {
    const { url } = req.query

    try {
      res.json({
        status: 200,
        result: await checkGame(url),
      })
    } catch (err) {
      next(err)
    }
  }
)

module.exports = gameRouter
