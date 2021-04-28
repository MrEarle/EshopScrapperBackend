const fetch = require('node-fetch')

const sendNotification = async (title, message, to) => {
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