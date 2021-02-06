const $ = require('cheerio')
const request = require('request')

const getGameHTML = async (url) => {
  const username = process.env.SCRAPBOT_API_USER,
    apiKey = process.env.SCRAPBOT_API_KEY,
    auth = 'Basic ' + Buffer.from(username + ':' + apiKey).toString('base64')
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: 'http://api.scraping-bot.io/scrape/raw-html',
        json: {
          url: url,
        },
        headers: {
          Accept: 'application/json',
          Authorization: auth,
        },
      },
      function (error, response, body) {
        let json = null
        try {
          json = JSON.parse(body)
        } catch (e) { }
        if (error || response.statusCode !== 200 || (json && json.error)) {
          let err
          if (json && json.error) {
            err = json.error
          } else if (error) {
            err = error
          } else {
            err = body
          }
          console.log(err)
          reject(err)
        }
        resolve(body)
      }
    )
  })
}

const cleanPrice = (priceHtml) => {
  let discounted = $('.discounted', priceHtml)
  if (discounted && discounted.length) {
    return discounted[0].children[2].data
  }
  return priceHtml.text()
}

const checkGame = async (url) => {
  const html = await getGameHTML(url)

  const selector = 'table.prices-table td img[alt~=🥇]'
  const cheapest = $(selector, html).parent().parent()

  const priceHtml = $('.price-value', cheapest)
  const price = +cleanPrice(priceHtml).replace(/( |\n|\$|\.)/g, '')

  return {
    url: url,
    price,
  }
}

module.exports = {
  checkGame,
}
