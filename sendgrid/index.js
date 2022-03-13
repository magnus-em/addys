const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const templates = {
    welcome: "d-6b49570d916d43f4bb3f22fc6053852a",
    forwardConfirm: 'd-4c74ae2c9eba4897862740273267b89e'
};

const supportEmail = 'support@addys.io'

module.exports.sendEmail = async function(clientId) {
    console.log('found client id', clientId)
    const client = await User.findById(clientId).populate('addy')
    console.log('found client', client)

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
           console.log("That's wassup!");
       }
    });
 }


 module.exports.sendForwardConfirm = catchAsync(async(clientId) => {
    const client = await User.findById(clientId).populate('addy')


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
        templateId: templates.forwardConfirm,
        dynamic_template_data: {
           first_name: client.firstName
        }
     };


    sgMail.send(msg, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log("That's wassup!");
        }
     });
 })

