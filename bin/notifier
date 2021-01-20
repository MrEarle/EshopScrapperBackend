#! /app/bin/node

const orm = require('../src/models')

const notifier = async () => {
  const games = await orm.Watchlist.findAll({
    include: [{
      model: orm.User,
      where: { device: { [orm.Sequelize.Op.not]: null } },
      through: { attributes: ['maxPrice'] }
    }]
  })

  const checklist = games.map(({ url, name, Users }) => ({
    url,
    name,
    users: Users.map(({ device, Subscription }) => ({ device, maxPrice: Subscription.maxPrice }))
  }))

  console.log(checklist)

  // return Promise.all(checklist.map(async ({ url, name, users }) => {
  //   const { price } = await checkGame(url)
  //   return Promise.all(users.map(async ({ device, maxPrice }) => {
  //     if (price <= maxPrice) {
  //       return sendNotification(name, `Price: ${price}`, device).then(() => console.log(device))
  //     }
  //   }))
  // }))
}

notifier().then(() => process.exit())
