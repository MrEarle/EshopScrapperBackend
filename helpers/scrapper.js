const express = require('express')
const fetch = require('node-fetch')
const pupeteer = require('puppeteer')
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

  const browser = await pupeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(url)
  let html = await page.content()
  // html =

  // console.log(html)
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