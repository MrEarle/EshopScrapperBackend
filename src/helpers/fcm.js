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
    .then(console.log)
    .catch(err => console.log(err) || 'Error')
  return res
}

module.exports = {
  sendNotification
}