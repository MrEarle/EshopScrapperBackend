const express = require('express')
const { validate } = require('express-jsonschema')
const { sendOneNotification } = require('../helpers/fcm')
const { validateEshopUrl } = require('../helpers/validators')

const gameValidator = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      format: 'url',
    },
    name: {
      type: 'string',
    },
  },
  required: ['name', 'url']
}

const approveValidator = {
  type: 'object',
  properties: gameValidator.properties,
}

const gameRequestRouter = express.Router()

gameRequestRouter.post(
  '/',
  validate({ body: gameValidator }),
  async (req, res) => {
    const { url, name } = req.body
    const user = req.user

    try {
      const gameRequest = await user.createGameRequest({ name, url })
      res.json({
        status: 200,
        result: {
          gameRequest: {
            name: gameRequest.name,
            url: gameRequest.url,
            userId: gameRequest.userId
          }
        }
      })
    } catch (err) {
      console.log(err)
      res.json({
        status: 400,
        error: err.message
      })
    }
  }
)

gameRequestRouter.post(
  '/approve/:id',
  validate({ body: approveValidator }),
  async (req, res) => {
    if (!req.user.isAdmin) {
      return res.send(403, {
        error: 'This route is restricted.'
      })
    }

    const { id: requestId } = req.params

    try {
      const gameRequest = await req.ctx.orm.GameRequest.findByPk(requestId)
      const url = req.body.url || gameRequest.url
      const name = req.body.name || gameRequest.name
      const requestUser = await gameRequest.getUser()

      if (!requestUser) {
        await gameRequest.destroy()
        res.json({
          status: 400,
          error: 'User does not exist',
        })
        return
      }

      const gameId = validateEshopUrl(url)
      if (!gameId) {
        res.json({
          status: 400,
          error: 'Invalid Eshop URL',
        })
        return
      }

      const entry = await req.ctx.orm.Watchlist.create({ url, name, gameId })

      await sendOneNotification(
        requestUser.device,
        'Game request approved!',
        `Your request for ${name} has been approved!`
      )

      await gameRequest.destroy()
      res.json({
        status: 200,
        result: entry,
      })
    } catch (err) {
      console.log(err)
      res.json({
        status: 500,
        error: err.message,
      })
    }
  }
)

gameRequestRouter.post(
  '/reject/:id',
  validate({ body: approveValidator }),
  async (req, res) => {
    if (!req.user.isAdmin) {
      return res.send(403, {
        error: 'This route is restricted.'
      })
    }

    const { id: requestId } = req.params

    try {
      const gameRequest = await req.ctx.orm.GameRequest.findByPk(requestId)
      const name = req.body.name || gameRequest.name
      const requestUser = await gameRequest.getUser()

      if (requestUser) {
        await sendOneNotification(
          requestUser.device,
          'Game request rejected',
          `Your request for ${name} has been rejected.`
        )
      }

      await gameRequest.destroy()
      res.json({
        status: 200
      })
    } catch (err) {
      console.log(err)
      res.json({
        status: 500,
        error: err.message,
      })
    }
  }
)

gameRequestRouter.get(
  '/',
  async (req, res) => {
    const { orm } = req.ctx
    const { limit, offset, search } = req.query

    const params = { limit: limit || 10, offset: offset || 0 }
    if (search) params.where = { name: { [orm.Sequelize.Op.iLike]: `%${search}%` } }

    const result = await orm.GameRequest.findAndCountAll(params)
    res.json({
      status: 200,
      result,
    })
  }
)

module.exports = gameRequestRouter