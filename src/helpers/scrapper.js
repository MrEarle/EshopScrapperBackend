const $ = require('cheerio')
const request = require('request')
const fetch = require('node-fetch')

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

const getGameHTML2 = async (url) => {
  const html = await fetch(`https://api.scrapingrobot.com?token=${process.env.SCRAPING_ROBOT_API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      url,
      module: "HtmlChromeScraper"
    })
  })
  return html
}

const cleanPrice = (priceHtml) => {
  let discounted = $('.discounted', priceHtml)
  if (discounted && discounted.length) {
    return discounted[0].children[2].data
  }
  return priceHtml.text()
}

const checkGame = async (url) => {
  const html = await getGameHTML2(url)

  const selector = 'table.prices-table td img[alt~=🥇]'
  const cheapest = $(selector, html).parent().parent()

  const priceHtml = $('.price-value', cheapest)
  const price = +cleanPrice(priceHtml).replace(/( |\n|\$|\.)/g, '')
  if (price === 0) {
    console.log(`Weird Price Detected:\n\turl: ${url}\n\tprice: ${price}`)
    console.log(cheapest)
    console.log(priceHtml)
  }

  return {
    url: url,
    price,
  }
}

module.exports = {
  checkGame,
}
