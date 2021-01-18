const express = require('express')
const { checkGame } = require('../helpers/scrapper')

const gameRouter = express.Router()

gameRouter.get('/', async (req, res, next) => {
  const { url } = req.query

  try {
    res.json({
      status: 200,
      result: await checkGame(url),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = gameRouter
