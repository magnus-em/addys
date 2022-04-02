const sgMail = require('@sendgrid/mail');
const Addy = require('../models/addy');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const clientTemplates = {
    welcome: "d-6b49570d916d43f4bb3f22fc6053852a",
    forwardConfirm: 'd-4c74ae2c9eba4897862740273267b89e',
    packageDroppedOff: 'd-24cf1f8ac7334e2797404627fbab3601',
    newPackageArrived: 'd-3cce2df40387473e93c50d746fa8a8b5'
};

const fwTemplates = {
    newForwardRequest: 'd-40ee91d3eec14d25abcc4343eb07ea9a'
}

const supportEmail = 'support@addys.io'

module.exports.sendWelcome = async function(user) {
    const client = await User.findById(user._id).populate('addy')

    const addy = `${client.addy.street1}, #${client.mailbox}, ${client.addy.city}, ${client.addy.state}, ${client.addy.zip}`

    const msg = {
       to: client.email,
       from: {
        "email": "support@addys.io",
        "name": "Addys"
      },
      reply_to: {
        "email": "support@addys.io",
        "name": "Addys Support"
      },
       templateId: clientTemplates.welcome,
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
    const client = await User.findById(details.client._id).populate('addy')


    const msg = {
        to: client.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: clientTemplates.forwardConfirm,
        dynamicTemplateData: {
            firstName: client.firstName,
            lastName: client.lastName,
            outboundTracking: details.pkg.tracking_number,
            inboundTracking: details.pkg.tracking,
            trackingLink: details.pkg.tracking_url_provider,
            paymentCard: details.pkg.paymentCard,
            labelAmount: details.pkg.labelAmount,
            forwardAmount: details.pkg.forwardAmount,
            paymentType: details.pkg.paymentType,
            paymentTotal: details.pkg.forwardAmount + details.pkg.labelAmount,
            shippingName: details.pkg.addressTo.name,
            street1: details.pkg.addressTo.street1,
            street2: details.pkg.addressTo.street2,
            city: details.pkg.addressTo.city,
            state: details.pkg.addressTo.state,
            zip: details.pkg.addressTo.zip
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

module.exports.sendClientPackageDroppedOff = catchAsync(async(details) => {
    const client = await User.findById(details.user._id).populate('addy')


    const msg = {
        to: client.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: clientTemplates.packageDroppedOff,
        dynamicTemplateData: {
            firstName: client.firstName,
            lastName: client.lastName,
            outboundTracking: details.pkg.tracking_number,
            inboundTracking: details.pkg.tracking,
            trackingLink: details.pkg.tracking_url_provider,
            paymentCard: details.pkg.paymentCard,
            labelAmount: details.pkg.labelAmount,
            forwardAmount: details.pkg.forwardAmount,
            paymentType: details.pkg.paymentType,
            paymentTotal: details.pkg.forwardAmount + details.pkg.labelAmount,
            shippingName: details.pkg.addressTo.name,
            street1: details.pkg.addressTo.street1,
            street2: details.pkg.addressTo.street2,
            city: details.pkg.addressTo.city,
            state: details.pkg.addressTo.state,
            zip: details.pkg.addressTo.zip
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

module.exports.sendClientNewPackageArrived = catchAsync(async(package, client) => {
    // const client = await User.findById(details.user._id).populate('addy')


    const msg = {
        to: client.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: clientTemplates.newPackageArrived,
        dynamicTemplateData: {
            firstName: client.firstName,
            shipper: package.shipper,
            lbs: package.lbs,
            oz: package.oz,
            tracking: package.tracking,

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

module.exports.sendFwNewRequest = catchAsync(async(package, client) => {
    // const client = await User.findById(details.user._id).populate('addy')
    const fw = await User.findById(client.addy.forwarder)


    const msg = {
        to: fw.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: fwTemplates.newForwardRequest,
        dynamicTemplateData: {
            firstName: fw.firstName,
            shipper: package.shipper,
            lbs: package.lbs,
            oz: package.oz,
            tracking: package.tracking,
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

module.exports.sendNewClient = catchAsync(async (client) => {
    const addy = await Addy.findById(client.addy._id).populate('forwarder');
    const fw = await User.findById(addy.forwarder._id);

    const msg = {
        to: fw.email,
        from: {
         "email": "support@addys.io",
         "name": "Addys"
       },
       reply_to: {
         "email": "support@addys.io",
         "name": "Addys Support"
       },
        templateId: clientTemplates.welcome,
        dynamic_template_data: {
           addy: client.addy
        }
     };
     sgMail.send(msg, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Sendgrid email sent");
        }
     });




})