const validateEshopUrl = (url) => {
  const pattern = /^https:\/\/eshop-prices\.com\/games\/(\d+)-.+$/
  const match = pattern.exec(url)
  if (!match) return null
  return match && match[1]
}

module.exports = { validateEshopUrl }