
const sgMail = require('@sendgrid/mail')
const SENDGRID_API_KEY='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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'melbournemagnus@gmail.com', // Change to your recipient
  from: 'support@addys.io', // Change to your verified sender
  subject: "Welcome to Addys! Here's your new address.",
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

