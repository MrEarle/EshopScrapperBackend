
const jwtgenerator = require('jsonwebtoken');

const generateToken = async (userId) => {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { userId, created: Date.now() },
      process.env.JWT_SECRET,
      {
        expiresIn: "2 days"
      },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult))
    )
  })
}

module.exports = { generateToken }