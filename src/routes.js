const gameRouter = require('./routes/checkGame')
const watchlistRouter = require('./routes/watchlist')

module.exports = {
  '/check': gameRouter,
  '/watchlist': watchlistRouter,
}
