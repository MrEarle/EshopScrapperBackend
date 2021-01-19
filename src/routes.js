const gameRouter = require('./routes/checkGame')
const subscriptionRouter = require('./routes/subscription')
const userRouter = require('./routes/user')
const watchlistRouter = require('./routes/watchlist')

module.exports = {
  free: {
    '/user': userRouter
  },
  authed: {
    '/check': gameRouter,
    '/watchlist': watchlistRouter,
    '/subs': subscriptionRouter
  }
}
