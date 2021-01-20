const express = require('express')
const { checkGame } = require('../helpers/scrapper')
const { validate } = require('express-jsonschema')
const { sendNotification } = require('../helpers/fcm')

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
  async (req, res) => {
    const { url } = req.query

    try {
      res.json({
        status: 200,
        result: await checkGame(url),
      })
    } catch (err) {
      res.json({
        status: 500,
        error: err
      })
    }
  }
)

gameRouter.post('/', async (req, res) => {
  const { orm } = req.ctx
  const games = await orm.Watchlist.findAll({
    include: [{
      model: orm.User,
      where: { device: { [orm.Sequelize.Op.not]: null } },
      through: { attributes: ['maxPrice'] }
    }]
  })

  const checklist = games.map(({ url, name, Users }) => ({
    url,
    name,
    users: Users.map(({ device, Subscription }) => ({ device, maxPrice: Subscription.maxPrice }))
  }))

  await Promise.all(checklist.map(async ({ url, name, users }) => {
    const { price } = await checkGame(url)
    return Promise.all(users.map(async ({ device, maxPrice }) => {
      if (price <= maxPrice) {
        return sendNotification(name, `Price: ${price}`, device).then(() => console.log(device))
      }
    }))
  }))

  res.json(checklist)
})

module.exports = gameRouter
