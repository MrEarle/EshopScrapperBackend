const express = require('express')
const { validate } = require('express-jsonschema')
const jwt = require('jsonwebtoken')
const { generateToken, generateRefreshToken } = require('../helpers/jwt')

const loginUserValidator = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
    // device: {
    //   type: 'string',
    // }
  },
  required: ['email', 'password']
}

const signUpValidator = {
  type: 'object',
  properties: {
    ...loginUserValidator.properties,
    username: {
      type: 'string',
      required: true,
    },
  },
  required: ['email', 'password', 'username']
}

const signOutValidator = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      required: true,
    },
  },
  required: ['token']
}

const userRouter = express.Router()

userRouter.post(
  '/auth',
  validate({ body: loginUserValidator }),
  async (req, res) => {
    const { email, password, device } = req.body

    const user = await req.ctx.orm.User.findOne({ where: { email } })
    if (user && (await user.checkPassword(password))) {
      if (device) {
        user.device = device
        user.save()
      }

      const token = await generateToken(user.id, user.email)
      const refreshToken = await generateRefreshToken(user.id, user.email)

      await user.update({ refreshToken })
      res.json({
        status: 200,
        result: {
          token,
          refreshToken,
          isAdmin: user.isAdmin
        },
      })
    } else {
      res.json({
        status: 401,
        error: 'Incorrect email or password',
      })
    }
  }
)

userRouter.post(
  '/signUp',
  validate({ body: signUpValidator }),
  async (req, res) => {
    if (req.ctx.currentUser) {
      return res.json({
        status: 400,
        error: "Can't sign up when logged in",
      })
    }

    const { username, email, password, device } = req.body

    const body = { username, email, password }
    if (device) body.device = device

    try {
      const user = await req.ctx.orm.User.create(body)
      const token = await generateToken(user.id, user.email)
      const refreshToken = await generateRefreshToken(user.id, user.email)

      await user.update({ refreshToken })

      res.json({
        status: 200,
        result: {
          token,
          refreshToken,
          isAdmin: user.isAdmin
        },
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 400,
        error: 'There was an error creating the user',
      })
    }
  }
)

userRouter.post(
  '/logout',
  validate({ body: signOutValidator }),
  async (req, res) => {
    console.log('logout')
    const { token } = req.body

    if (!token) return res.sendStatus(401)
    let user
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      user = await req.ctx.orm.User.findOne({ where: { email: decoded.email } })
    } catch (err) {
      res.sendStatus(403)
      return
    }

    await user.update({ refreshToken: null, device: null })

    res.sendStatus(200)
  }
)

userRouter.post(
  '/token',
  async (req, res) => {
    const { token } = req.body

    if (!token) return res.sendStatus(401)

    let user
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      user = await req.ctx.orm.User.findOne({ where: { email: decoded.email } })
    } catch (err) {
      res.sendStatus(403)
      return
    }

    if (user.refreshToken !== token) return res.sendStatus(403)

    const accessToken = await generateToken(user.id, user.email)

    res.json({
      status: 200,
      result: { token: accessToken }
    })
  }
)

module.exports = userRouter
