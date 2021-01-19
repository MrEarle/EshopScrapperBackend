const express = require('express')
const { validate } = require('express-jsonschema')
const { validateEshopUrl } = require('../helpers/validators')

const watchlistSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
  },
}

const watchlistRouter = express.Router()

watchlistRouter.get('/', async (req, res) => {
  const { limit, offset } = req.query
  const result = await req.ctx.orm.Watchlist.findAndCountAll({ limit, offset })
  res.json({
    status: 200,
    result,
  })
})

watchlistRouter.post('/', validate({ body: watchlistSchema }), async (req, res) => {
  const { url, name } = req.body

  const gameId = validateEshopUrl(url)
  if (!gameId) {
    res.json({
      status: 400,
      error: 'Invalid Eshop URL',
    })
    return
  }

  try {
    const entry = await req.ctx.orm.Watchlist.create({ url, name, gameId })
    res.json({
      status: 200,
      result: entry,
    })
  } catch (err) {
    res.json({
      status: 500,
      error: err,
    })
  }
})

module.exports = watchlistRouter
