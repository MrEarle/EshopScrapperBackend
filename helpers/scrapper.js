const express = require('express')
const $ = require('cheerio')
const request = require('request');

const username = "mrearle",
  apiKey = "dlSFFT0sjP7ESJGN8C1ZHlqpO",
  url = 'https://eshop-prices.com/games/5359-hyrule-warriors-age-of-calamity?currency=CLP',
  auth = "Basic " + Buffer.from(username + ":" + apiKey).toString("base64");

const getGameHTML = async url => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: 'http://api.scraping-bot.io/scrape/raw-html',
        json: {
          url: url
        },
        headers: {
          Accept: 'application/json',
          Authorization: auth
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(error)
          reject()
        }
        resolve(body)
      }
    );
  })
}

const gameRouter = express.Router()

const cleanPrice = priceHtml => {
  let discounted = $('.discounted', priceHtml)
  if (discounted) {
    return discounted[0].children[2].data
  }
  return priceHtml.text()
}

const checkGame = async url => {
  const html = await getGameHTML(url)

  console.log(html)
  const selector = 'table.prices-table td img[alt~=🥇]'
  const cheapest = $(selector, html).parent().parent()

  const priceHtml = $('.price-value', cheapest)
  const price = +(cleanPrice(priceHtml).replace(/( |\n|\$|\.)/g, ''))

  return {
    url: url,
    price
  }
}

gameRouter.get('/', async (req, res) => {
  const { url } = req.query

  res.json({
    status: 200,
    result: await checkGame(url)
  })
})

module.exports = gameRouter
