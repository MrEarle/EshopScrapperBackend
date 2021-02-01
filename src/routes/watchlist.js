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
  const { orm } = req.ctx
  const { limit, offset, search } = req.query

  const params = { limit: limit || 10, offset: offset || 0 }
  if (search) params.where = { name: { [orm.Sequelize.Op.iLike]: `%${search}%` } }

  const result = await orm.Watchlist.findAndCountAll(params)
  res.json({
    status: 200,
    result,
  })
})

watchlistRouter.post('/', validate({ body: watchlistSchema }), async (req, res) => {
  const { url, name } = req.body

  if (!req.user.isAdmin) {
    return res.send(403, {
      error: 'This route is restricted.'
    })
  }

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
