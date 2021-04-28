const express = require('express')

const pushedRouter = express.Router()

pushedRouter.post('/start', async (req, res) => {
  const { pushedId } = req.body

  if (!pushedId) {
    res.sendStatus(400)
    return
  }

  await req.user.update({ usePushed: true, device: pushedId })

  res.sendStatus(200)
})


pushedRouter.post('/stop', async (req, res) => {
  await req.user.update({ usePushed: false, device: null })

  res.sendStatus(200)
})

module.exports = pushedRouter