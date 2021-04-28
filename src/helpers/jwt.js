const jwtgenerator = require('jsonwebtoken')

const generateToken = async (userId, email) => {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { userId, email, created: Date.now() },
      process.env.JWT_SECRET,
      {
        expiresIn: '30m',
      },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult))
    )
  })
}

const generateRefreshToken = async (userId, email) => {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { userId, email, created: Date.now() },
      process.env.JWT_REFRESH_SECRET,
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult))
    )
  })
}

module.exports = { generateToken, generateRefreshToken }
