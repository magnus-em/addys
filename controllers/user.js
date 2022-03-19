const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')
const { getShipment, createTransaction, getRate } = require('../shippo')
const { sendWelcome, sendForwardConfirm } = require('../sendgrid')
const shippo = require('shippo')(process.env.SHIPPO_TEST);
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const {getSubAmount} = require('../utils/constants')


const { initialAccountCharge, getCustomerProfileIds, createCustomerProfile, deleteCustomerProfile, createCustFromTrx, getCustomerProfile, getCustomerPaymentProfile, createCustomerProfileNoPayment, createCustomerPaymentProfile, chargeRate, deleteCustomerPaymentProfile, createSubscription, getSubscription, chargeUpgrade, changeSubscriptionTier, changeSubscriptionPayment } = require('../authnet')



module.exports.renderLoginForm = async (req, res) => {
    res.locals.title = "Addys Login"
    res.locals.description = "Login to manage your packages"
    res.render('client/login')
}

module.exports.renderRegisterForm = catchAsync(async (req, res) => {
    res.locals.title = "Sign up for Addys"
    res.locals.description = "Sign up to start using residential addresses to forward you packages"
    console.log(req.query.addy)
    if (!req.query.addy) {
        return res.redirect('/locations')
    }
    const addy = await Addy.findById(req.query.addy)
    res.render('client/register/register', { addy })
})

module.exports.resetForm = (req, res) => {
    res.locals.title = "Reset password"
    res.locals.description = "Can't remember your password? No worries, just complete this easy form."

    res.render('client/resetPw')
}

module.exports.createUser = catchAsync(async (req, res, next) => {
    try {
        if (req.body.invite != 69420) {
            throw new Error('Invalid invite code')
        }
        const { email, username, password, invite, firstName, lastName, phone } = req.body

        const details = {
            cardNumber: req.body.cardNumber,
            cardExp: req.body.cardExp,
            cvv: req.body.cvv,
            firstName: req.body.billingFirstName,
            lastName: req.body.billingLastName,
            street1: req.body.street1,
            street2: req.body.street2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            amount: '0.01'
        }
        const response = await initialAccountCharge(details)
        console.log('response in user controller')
        console.log(response)

        if (response.getTransactionResponse().getResponseCode() != 1) {
            return res.send(response.getTransactionResponse().getMessages().getMessage()[0].getDescription())
        }
        const addy = await Addy.findById(req.body.addy).populate('clients')
        const mailbox = addy.clients.length + 33; // make it seem like there are more people reshipping
        const user = new User({ email, username, addy, mailbox, type: 'CLIENT', invite, firstName, lastName, phone })
        await addy.clients.push(user._id)     // if you pass in just the user object here, mongoose goes into a recursive error.
        await addy.save()
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
        })
        details.client = user;

        const createProfile = await createCustomerProfileNoPayment(details)
        if (createProfile.success) {
            user.customerProfileId = createProfile.id
            console.log('saved profile id ' + createProfile.id)
            const newPaymentProfileResponse = await createCustomerPaymentProfile(details, createProfile.id, true)
            const customerPaymentId = newPaymentProfileResponse.getCustomerPaymentProfileId()
            user.customerPaymentIds.push(customerPaymentId)

            const subscription = {
                tier: 'BASIC',
            }
            const newSubscriptionId = await createSubscription(subscription, user.customerProfileId, customerPaymentId)
            subscription.id = newSubscriptionId;
            user.subscription = subscription;
            user.subscription.payment = customerPaymentId
            await user.save()
            console.log('USER POST SAVE WITH SUBSCRIPTION')
            console.log(user)

        }

        console.log('NEW USER CREATED')
        console.log(user)
        req.flash('success', 'New user successfully created')
        sendWelcome(user)
        res.render('client/register/success', { user })
    } catch (err) {
        req.flash('error', err.message)
        console.log('in the user.createUser error handler', err.stack)
        res.redirect(`/register?addy=${req.body.addy}`)
    }
})

module.exports.login = catchAsync(async (req, res) => {
    if (req.user.type == 'ADMIN') {
        return res.redirect('/admin/dash/all')
    } else if (req.user.type == 'FW') {
        let msg = {
            to: 'melbournemagnus@gmail.com', // Change to your recipient
            from: 'support@addys.io', // Change to your verified sender
            subject: "Successful forwarder login",
            text: 'Signed in as fw',
            html: '<strong>Signed in as fw</strong>',
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
        return res.redirect('/forwarder/dash/pending')
    }
    // const redirectUrl = req.session.returnTo || '/client/inbox/new'
    const redirectUrl = '/client/inbox/new'
    delete req.session.returnTo

    res.redirect(redirectUrl)
})

module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'Logged out')
    res.redirect('/login')
}

module.exports.inbox = catchAsync((async (req, res) => {
    res.locals.title = "New packages"
    res.locals.description = "Newly uploaded packages that are ready for you to submit a forward request"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('client/inbox/new', { user })
}))
module.exports.inboxPending = catchAsync((async (req, res) => {
    res.locals.title = "Pending"
    res.locals.description = "Packages that been forward requested and are awaiting drop off by your forwarder"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('client/inbox/pending', { user })
}))
module.exports.inboxForwarded = catchAsync((async (req, res) => {
    res.locals.title = "Forwarded"
    res.locals.description = "Packages that have been forwarded"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('client/inbox/forwarded', { user })
}))

module.exports.saveAddress = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
    const address = {
        name: req.body.name,
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip
    }
    user.addresses.push(address)
    await user.save()
    res.redirect('/client/account/addresses')
})

module.exports.deleteAddress = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
    const index = req.params.id - 1;
    console.log(index)
    console.log(user.addresses[index])
    user.addresses.splice(index, 1)
    await user.save()
    res.redirect('/client/account/addresses')
})

//forward flow

module.exports.addressForm = catchAsync(async (req, res) => {
    res.locals.title = 'Choose Address'
    res.locals.description = "Choose which address you'd like to ship your package to"

    const { id } = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('client/forward/address', { user })
})

module.exports.shippingForm = catchAsync(async (req, res) => {
    res.locals.title = 'Choose Shipping'
    res.locals.description = 'Choose your preferred shipping service'

    const { id } = req.params
    console.log(req.query)
    res.locals.query = req.query
    const user = await User.findById(req.user._id).populate('addy')
    const addressTo = await user.addresses.id(req.query.address)
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    user.pkg = pkg;
    user.shipment = await getShipment(addressTo, addy);
    res.render('client/forward/shipping', { user })
})

module.exports.paymentForm = catchAsync(async (req, res) => {
    res.locals.title = 'Choose Payment'
    res.locals.description = 'Choose the payment method you want to use to pay for your label and forward fee'

    res.locals.query = req.query
    const { id } = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;

    const payments = []

    try {
        for (let id of user.customerPaymentIds) {
            let response = await getCustomerPaymentProfile(user.customerProfileId, id)
            payments.push({
                id: response.getPaymentProfile().getCustomerPaymentProfileId(),
                firstName: response.getPaymentProfile().getBillTo().getFirstName(),
                lastName: response.getPaymentProfile().getBillTo().getLastName(),
                cardNumber: response.getPaymentProfile().getPayment().getCreditCard().getCardNumber(),
                cardType: response.getPaymentProfile().getPayment().getCreditCard().getCardType(),
                cardExp: response.getPaymentProfile().getPayment().getCreditCard().getExpirationDate(),
                default: response.getPaymentProfile().getDefaultPaymentProfile()
            })
        }

    } catch (error) {
        console.log(error)
        user.payments = []
    }

    user.payments = payments;


    res.render('client/forward/payment', { user })
})

module.exports.overviewForm = catchAsync(async (req, res) => {
    res.locals.title = 'Overview'
    res.locals.description = 'Overview your forward request details'

    res.locals.query = req.query
    const { id } = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('client/forward/overview', { user })
})

module.exports.forward = catchAsync(async (req, res) => {
    const { id } = req.params

    const user = await User.findById(req.user._id).populate('addy')


    const shipment = await shippo.shipment.retrieve(req.body.shipment);
    console.log('found shipment')
    console.log(shipment)

    const rate = await shippo.rate.retrieve(req.body.rate);
    console.log('found rate')
    console.log(rate.amount)


    const response = await chargeRate({ rate, shipment }, user.customerProfileId, req.body.payment)
    console.log('response -----')
    console.log(response)

    console.log('response code')
    console.log(response.getTransactionResponse().responseCode)

    if (response.getTransactionResponse().responseCode == 1) {
        const trx = await createTransaction(req.body.rate)
        console.log(trx)
        console.log('trx created')
        console.log(trx.tracking_url_provider)
    }


    // const pkg = await Package.findById(id);
    // pkg.shippo = trx;
    // pkg.label_url = trx.label_url;
    // pkg.tracking_number = trx.tracking_number;
    // pkg.tracking_url_provider = trx.tracking_url_provider;
    // pkg.status = 'PENDING'
    // pkg.save()
    // console.log(pkg)
    // console.log(req.body)
    res.redirect('/client/inbox/new')
})


// account pages

module.exports.personal = catchAsync(async (req, res) => {
    res.locals.title = 'Personal info'
    res.locals.description = 'View and edit your personal information'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');


    res.render('client/account/personal', { user })
})

module.exports.security = catchAsync(async (req, res) => {
    res.locals.title = 'Security'
    res.locals.description = 'View and edit your security information'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');


    res.render('client/account/security', { user })
})

module.exports.payments = catchAsync(async (req, res) => {
    res.locals.title = 'Payments'
    res.locals.description = 'View and edit your payment methods'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    const payments = []

    try {
        for (let id of user.customerPaymentIds) {
            let response = await getCustomerPaymentProfile(user.customerProfileId, id)
            payments.push({
                id: response.getPaymentProfile().getCustomerPaymentProfileId(),
                firstName: response.getPaymentProfile().getBillTo().getFirstName(),
                lastName: response.getPaymentProfile().getBillTo().getLastName(),
                cardNumber: response.getPaymentProfile().getPayment().getCreditCard().getCardNumber(),
                cardType: response.getPaymentProfile().getPayment().getCreditCard().getCardType(),
                cardExp: response.getPaymentProfile().getPayment().getCreditCard().getExpirationDate(),
                default: response.getPaymentProfile().getDefaultPaymentProfile()
            })
        }

        const sub = await getSubscription(user.subscription.id)
        user.subscription.name = sub.getName(),
        user.subscription.startDate = sub.getPaymentSchedule().getStartDate().slice(8,10),
        user.subscription.amount = sub.getAmount(),
        user.subscription.status = sub.getStatus()
        user.subscription.transactions = sub.getArbTransactions()
        
        console.log(sub.getArbTransactions())
    } catch (error) {
        console.log(error)
        user.payments = []
    }

    user.payments = payments

    res.render('client/account/payments', { user })
})

module.exports.addPayment = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
    const details = {
        cardNumber: req.body.cardNumber,
        cardExp: req.body.cardExp,
        cvv: req.body.cvv,
        firstName: req.body.billingFirstName,
        lastName: req.body.billingLastName,
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
    }
    const response = await createCustomerPaymentProfile(details, req.user.customerProfileId, true)
    user.customerPaymentIds.push(response.getCustomerPaymentProfileId())
    await user.save()

    console.log(response)

    res.redirect('/client/account/payments')


})

module.exports.deletePayment = catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.user)
    await deleteCustomerPaymentProfile(req.user.customerProfileId, id)
    const user = await User.findByIdAndUpdate(req.user, { $pull: { customerPaymentIds: id } }, { new: true })
    console.log('deleted customerPaymentId from following client')
    console.log(user)


    res.redirect('/client/account/payments')
})

module.exports.changeSubscription = catchAsync(async (req,res) => {
    const {subscription} = req.body;
    const user = await User.findById(req.user._id)

    console.log('-----getSubAmount(subscription)-------')
    console.log( getSubAmount(subscription))
    console.log('-----getSubAmount(user.subscription.tier)-------')
    console.log(getSubAmount(user.subscription.tier))
    console.log('-----UPGRADE FEE-------')


    const upgradeFee = getSubAmount(subscription) - getSubAmount(user.subscription.tier)
    console.log(upgradeFee)
    if (upgradeFee > 0) {
        await chargeUpgrade(upgradeFee, user.customerProfileId, user.subscription.payment)
    }
    user.subscription.tier = subscription
    await user.save()
    const response = await changeSubscriptionTier(subscription, user.subscription.id)
    console.log('subscription from req.body')
    console.log(subscription)
    res.redirect('/client/account/payments')
})

module.exports.changeSubscriptionPayment = catchAsync(async (req,res) => {
    const {payment} = req.body;
    const user = await User.findById(req.user._id)
    user.subscription.payment = payment
    await  changeSubscriptionPayment(user.subscription.id, user.customerProfileId, payment)
    await user.save()
    res.redirect('/client/account/payments')

})


module.exports.address = catchAsync(async (req, res) => {
    res.locals.title = 'Addresses'
    res.locals.description = 'View and edit your addresses'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');

    res.render('client/account/addresses', { user })
})



