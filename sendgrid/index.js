const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const templates = {
    welcome: "d-6b49570d916d43f4bb3f22fc6053852a",
    forwardConfirm: 'd-4c74ae2c9eba4897862740273267b89e'
};

const supportEmail = 'support@addys.io'

module.exports.sendWelcome = async function(user) {
    const client = await User.findById(user._id).populate('addy')

    const addy = `${client.addy.address1}, #${client.mailbox}, ${client.addy.city}, ${client.addy.state}, ${client.addy.zip}`

    const msg = {
       to: 'melbournemagnus@gmail.com',
       from: {
        "email": "support@addys.io",
        "name": "Addys Team"
      },
      reply_to: {
        "email": "support@addys.io",
        "name": "Addys Support"
      },
       templateId: templates.welcome,
       dynamic_template_data: {
          addy: addy
       }
    };
    sgMail.send(msg, (error, result) => {
       if (error) {
           console.log(error);
       } else {
           console.log("Sendgrid email sent");
       }
    });
 }


 module.exports.sendForwardConfirm = catchAsync(async(details) => {
    const client = await User.findById(details.user._id).populate('addy')


    const msg = {
        to: client.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys Team"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: templates.forwardConfirm,
        dynamicTemplateData: {
            firstName: 'Testing Templates',
            tracking: 'Some One',
            city: 'Denver',
          },
     };


    sgMail.send(msg, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Sendgrid email sent");
        }
     });
 })

