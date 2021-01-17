const express = require('express')
const fetch = require('node-fetch')
const $ = require('cheerio')

const gameRouter = express.Router()

const cleanPrice = priceHtml => {
  let discounted = $('.discounted', priceHtml)
  if (discounted) {
    return discounted[0].children[2].data
  }
  return priceHtml.text()
}

const checkGame = async url => {
  const html = await fetch(url, { method: 'GET' })
    .then(res => res.text())
    .catch(err => {
      console.log(err)
    })
  const selector = 'table.prices-table td img[alt~=🥇]'
  const cheapest = $(selector, html).parent().parent()

  const priceHtml = $('.price-value', cheapest)
  const price = +(cleanPrice(priceHtml).replace(/( |\n|\$)/g, ''))

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