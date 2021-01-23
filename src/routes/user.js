const express = require('express')
const { validate } = require('express-jsonschema')
const { generateToken } = require('../helpers/jwt')

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
      res.json({
        status: 200,
        result: {
          token,
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

      res.json({
        status: 200,
        result: {
          token,
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

module.exports = userRouter
