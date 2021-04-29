const fetch = require('node-fetch')
const { Expo } = require('expo-server-sdk')

const sendNotification = async (notifications) => {
  const expo = new Expo()

  const messages = []

  notifications.forEach(({ name, price, device }) => {
    if (!Expo.isExpoPushToken(device)) {
      console.error(`Push token ${device} is not a valid Expo push token`)
      continue
    }

    messages.push({
      to: device,
      sound: 'default',
      title: name,
      body: `Price: $${price}`
      // data
    })
  })

  const chunks = expo.chunkPushNotifications(messages)

  return Promise.all(chunks.map(async (chunk) => {
    try {
      return expo.sendPushNotificationsAsync(chunk)
    } catch (err) {
      console.error(err)
      return null
    }
  }))
}

const sendFirebaseNotification = async (title, message, to) => {
  const options = {
    mode: 'cors',
    method: 'POST',
    headers: {
      authorization: `key=${process.env.FIREBASE_FCM_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      collapse_key: 'type_a',
      notification: {
        title,
        body: message
      },
      data: {
        title,
        body: message
      },
      to
    })
  }

  const res = await fetch("https://fcm.googleapis.com/fcm/send", options)
    .then(r => r.text())
    .catch(err => console.log(err) || 'Error')
  return res
}

const sendPushedNotification = async (url, message, pushedId) => {
  const res = await fetch("https://api.pushed.co/1/push", {
    mode: 'cors',
    method: "POST",
    body: JSON.stringify({
      app_key: process.env.PUSHED_APP_KEY,
      app_secret: process.env.PUSHED_APP_SECRET,
      content: message,
      content_type: 'url',
      content_extra: url,
      target_type: 'pushed_id',
      pushed_id: pushedId
    })
  }).then(r => r.text())
    .catch(err => console.log(err) || 'Error')
  console.log(res)
  return res
}

module.exports = {
  sendNotification,
  sendPushedNotification
}