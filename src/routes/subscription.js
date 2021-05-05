const express = require('express')
const { validate } = require('express-jsonschema')

const subsValidate = {
  type: 'object',
  properties: {
    maxPrice: {
      type: 'number',
      required: true,
    },
  },
}

const subscriptionRouter = express.Router()

subscriptionRouter.get('/', async (req, res) => {
  const user = req.user
  const { orm } = req.ctx
  const { limit, offset, search } = req.query

  const params = {
    limit: limit || 10,
    offset: offset || 0,
    order: [['name', 'ASC']]
  }
  if (search) params.where = { name: { [orm.Sequelize.Op.iLike]: `%${search}%` } }

  try {
    const watchlists = await user.getWatchlists(params)
    const count = await user.countWatchlists()
    res.json({
      status: 200,
      result: { count, rows: watchlists },
    })
  } catch (err) {
    res.json({
      status: 400,
      error: err.message,
    })
  }
})

subscriptionRouter.post(
  '/subscribe/:id',
  validate({ body: subsValidate }),
  async (req, res) => {
    const { id: watchlistId } = req.params
    const user = req.user
    const { maxPrice } = req.body

    try {
      const game = await req.ctx.orm.Watchlist.findByPk(watchlistId)
      const sub = user.addWatchlist(game, { through: { maxPrice } })
      res.json({
        status: 200,
        result: {
          subscription: {
            watchlistId: +watchlistId,
            userId: user.id,
            maxPrice,
          },
        },
      })
    } catch (err) {
      res.json({
        status: 400,
        error: err.message,
      })
    }
  }
)

subscriptionRouter.delete('/unsubscribe/:id', async (req, res) => {
  const { id: watchlistId } = req.params
  const user = req.user

  try {
    const game = await req.ctx.orm.Watchlist.findByPk(watchlistId)
    const sub = user.removeWatchlist(game)
    res.json({
      status: 200,
    })
  } catch (err) {
    res.json({
      status: 400,
      error: err.message,
    })
  }
})

module.exports = subscriptionRouter
