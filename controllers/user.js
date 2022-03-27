const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')
const { getShipment, createTransaction, getRate } = require('../shippo')
const { sendWelcome, sendForwardConfirm, sendFwNewRequest } = require('../sendgrid')
const shippo = require('shippo')(process.env.SHIPPO_TEST);
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const { getSubAmount, getTierQuota, getTierForwardFee } = require('../utils/constants')


const { initialAccountCharge, getCustomerProfileIds, createCustomerProfile, deleteCustomerProfile, createCustFromTrx, getCustomerProfile, getCustomerPaymentProfile, createCustomerProfileNoPayment, createCustomerPaymentProfile, chargeRate, deleteCustomerPaymentProfile, createSubscription, getSubscription, chargeUpgrade, changeSubscriptionTier, changeSubscriptionPayment, getTransactionListForCustomer, cancelSubscription } = require('../authnet')



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

        const overlappingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email },
                { phone: phone }
            ]
        })

        if (overlappingUser) {
            req.flash('error', 'Email / Username / Phone already in use')
            return res.redirect(`/register?addy=${req.body.addy}`)
        }

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

        try {
            const response = await initialAccountCharge(details)
        } catch (err) {
            req.flash('error', err.getTransactionResponse().getErrors().getError()[0].getErrorText())
            return res.redirect(`/register?addy=${req.body.addy}`)
        }

        const addy = await Addy.findById(req.body.addy).populate('clients')
        addy.mailboxCounter += 1;
        const mailbox = addy.mailboxCounter;
        const user = new User({ email, username, addy, mailbox, type: 'CLIENT', invite, firstName, lastName, phone })
        await addy.clients.push(user._id)     // if you pass in just the user object here, mongoose goes into a recursive error.
        await addy.save()

        const registeredUser = await User.register(user, password)


        req.login(registeredUser, err => {
            if (err) return next(err);
        })
        details.client = user;

        let createProfile = null;
        try {
            createProfile = await createCustomerProfileNoPayment(details)

        } catch (err) {
            req.flash('error', err.getMessages().getMessage()[0].getText())
            return res.redirect(`/register?addy=${req.body.addy}`)
        }

        if (createProfile.success) {
            user.customerProfileId = createProfile.id
            console.log('saved profile id ' + createProfile.id)

            let newPaymentProfileResponse = null;
            try {
                newPaymentProfileResponse = await createCustomerPaymentProfile(details, createProfile.id, true)

            } catch (err) {
                req.flash('error', err.getMessages().getMessage()[0].getText())
                return res.redirect(`/register?addy=${req.body.addy}`)
            }
            const customerPaymentId = newPaymentProfileResponse.getCustomerPaymentProfileId()
            user.customerPaymentIds.push(customerPaymentId)

            const subscription = {
                tier: 'BASIC',
            }

            let newSubscriptionId = null;
            try {
                newSubscriptionId = await createSubscription(subscription, user.customerProfileId, customerPaymentId)
            } catch (err) {
                req.flash('error', err.getMessages().getMessage()[0].getText())
                return res.redirect(`/register?addy=${req.body.addy}`)
            }

            subscription.id = newSubscriptionId;
            user.subscription = subscription;
            user.subscription.payment = customerPaymentId
            await user.save()
            console.log('USER POST SAVE WITH SUBSCRIPTION')
            console.log(user)

        }

        console.log('NEW USER CREATED')
        console.log(user)
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
        return res.redirect('/admin/')
    } else if (req.user.type == 'FW') {
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

module.exports.changePassword = catchAsync(async (req, res) => {
    const { password } = req.body
    const user = await User.findById(req.user._id)
    await user.setPassword(password)

    user.save()
    req.flash('success', 'Successfully changed password :)')

    res.redirect('/client/account/security')
})

module.exports.changeEmailPhone = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
    const { email, phone } = req.body;
    if (phone && email) {
        user.email = email
        user.phone = phone
        req.flash('success', 'Successfully changed email and password')
    } else if (phone) {
        user.phone = phone
        req.flash('success', 'Successfully changed phone')
    } else {
        user.email = email
        req.flash('success', 'Successfully changed email')
    }
    await user.save()
    res.redirect('/client/account/personal')
})



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
    const shippoAddress = await shippo.address.create({
        name: req.body.name,
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip,
        validate: true
    })
    if (!shippoAddress.validation_results.is_valid){
        req.flash('error','Invalid address')
        return res.redirect('/client/account/addresses')
    }
    const address = {
        name: req.body.name,
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip
    }
    address.shippo = shippoAddress;
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
    const user = await User.findById(req.user._id).populate('addy')
    const monthlyForwards = await Package.find({
        client: req.user._id,
        status: 'FORWARDED',
        forwardedDate: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) }
    })
    if (monthlyForwards.length >= getTierQuota(user.subscription.tier)) {
        if (user.subscription.tier == 'NONE') {
            req.flash('error', 'Please buy a subscription if you wish to forward packages')
            return res.redirect('/client/account/payments/')
        }
        req.flash('error', 'Monthly forward limit reached. Please upgrade your plan or wait for your limit to lower.')
        return res.redirect('/client/inbox/new')
    }

    const { id } = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
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
    const user = await User.findById(req.user._id).populate('addy')


    res.locals.query = req.query
    const { id } = req.params
    const { shipment } = req.query
    const rate = await shippo.rate.retrieve(req.query.rate);
    const address = await user.addresses.id(req.query.address)


    console.log('rate, shipment, query')
    console.log(rate)
    console.log(shipment)
    console.log(address)
    const package = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    user.pkg = package;
    res.render('client/forward/overview', { user, rate, address, package })
})

module.exports.forward = catchAsync(async (req, res) => {
    const { id } = req.params

    const client = await User.findById(req.user._id).populate('addy')

    console.log('req.body.address')
    console.log(req.body.address)

    const addressTo = await client.addresses.id(req.body.address)

    console.log('address to -----')
    console.log(addressTo)

    const shipment = await shippo.shipment.retrieve(req.body.shipment);
    console.log('found shipment')
    console.log(shipment)

    const rate = await shippo.rate.retrieve(req.body.rate);
    console.log('found rate')
    console.log(rate.amount)


    try {
        const response = await chargeRate({ rate, shipment }, client.customerProfileId, req.body.payment)
        console.log('response -----')
        console.log(response)

        console.log('response code')
        console.log(response.getTransactionResponse().responseCode)

        if (response.getTransactionResponse().responseCode == 1) {
            const trx = await createTransaction(req.body.rate)
            console.log(trx)
            console.log('trx created')
            console.log(trx.tracking_url_provider)
            const pkg = await Package.findById(id);
            pkg.shippo = trx;
            pkg.label_url = trx.label_url;
            pkg.tracking_number = trx.tracking_number;
            pkg.tracking_url_provider = trx.tracking_url_provider;
            pkg.forwardedDate = Date.now();
            pkg.status = 'PENDING'
            pkg.paymentId = response.getTransactionResponse().getTransId()
            pkg.paymentType = response.getTransactionResponse().getAccountType();
            pkg.paymentCard = response.getTransactionResponse().getAccountNumber();
            pkg.labelAmount = rate.amount;
            pkg.forwardAmount = getTierForwardFee(client.subscription.tier);
            pkg.addressTo = addressTo;
            pkg.save()
            req.flash('success', 'Package forwarded')
            sendForwardConfirm({ pkg, client })
            sendFwNewRequest(pkg, client)
            return res.redirect('/client/inbox/new')
        }
    } catch (error) {
        req.flash('error', error.getTransactionResponse().getErrors().getError()[0].getErrorText())
    }
    res.redirect('/client/inbox/new')
})


// account pages

module.exports.personal = catchAsync(async (req, res) => {
    res.locals.title = 'Personal info'
    res.locals.description = 'View and edit your personal information'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');


    res.render('client/account/personal', { user })
})
module.exports.deleteAccount = catchAsync(async (req, res) => {
    req.flash('error', 'Please contact support via email or live chat to finalize account closure')
    res.redirect('/client/account/personal')
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

    const monthlyForwards = await Package.find({
        client: user._id,
        status: 'FORWARDED',
        forwardedDate: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) }
    })


    try {
        const transactionList = []
        const allTransactionsResponse = await getTransactionListForCustomer(user.customerProfileId)
        var transactions = allTransactionsResponse.getTransactions().getTransaction();
        for (var i = 0; i < transactions.length; i++) {
            transactionList.push({
                id: transactions[i].getTransId(),
                status: transactions[i].getTransactionStatus(),
                type: transactions[i].getAccountType(),
                amount: transactions[i].getSettleAmount(),
                time: transactions[i].getSubmitTimeLocal()
            })
        }

        user.transactionList = transactionList;


    } catch (e) {
        user.transactionList = [];
        console.log(e)
    }


    try {
        const payments = []

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
        user.payments = payments


    } catch (e) {
        user.payments = []
        console.log(e)
    }


    try {
        if (user.subscription.tier == 'NONE') {
            user.subscription.name = 'None'
            user.subscription.startDate = 'N/A'
            user.subscription.amount = '0'
            user.subscription.status = 'Cancelled'
        } else {
            const subResponse = await getSubscription(user.subscription.id)
            const sub = subResponse.getSubscription()
            user.subscription.name = sub.getName()
            user.subscription.startDate = sub.getPaymentSchedule().getStartDate().slice(8, 10)
            user.subscription.amount = sub.getAmount()
            user.subscription.status = sub.getStatus()
        }

    } catch (error) {
        console.log(error)
        user.subscription.name = 'NONE',
            user.subscription.startDate = 'N/A',
            user.subscription.amount = '0',
            user.subscription.status = 'N/A'
        arbTransactionList = []
    }

    user.monthlyForwards = monthlyForwards;

    if (user.subscription.tier == 'NONE') {
        user.monthlyPercentage = 0
    } else {
        user.monthlyPercentage = monthlyForwards.length / getTierQuota(user.subscription.tier) * 100;
    }

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

module.exports.changeSubscription = catchAsync(async (req, res) => {
    const { subscription } = req.body;
    const user = await User.findById(req.user._id)

    console.log('-----getSubAmount(user.subscription.tier)-------')
    console.log(getSubAmount(user.subscription.tier))

    if (user.subscription.tier == 'NONE') {
        try {
            const upgradeFee = getSubAmount(subscription) - getSubAmount(user.subscription.tier)

            await chargeUpgrade(upgradeFee, user.customerProfileId, user.subscription.payment)
            newSubscriptionId = await createSubscription({ tier: subscription }, user.customerProfileId, user.subscription.payment)
            user.subscription.id = newSubscriptionId;
            user.subscription.tier = subscription;
            await user.save()
            return res.redirect('/client/account/payments')


        } catch (err) {
            req.flash('error', err.errorMsg)
            console.log('change sub error')
            console.log(err)
            return res.redirect('/client/account/payments')

        }

    }


    const upgradeFee = getSubAmount(subscription) - getSubAmount(user.subscription.tier)
    if (upgradeFee > 0) {
        try {
            await chargeUpgrade(upgradeFee, user.customerProfileId, user.subscription.payment)

        } catch (err) {
            req.flash('error', err.getTransactionResponse().getErrors().getError()[0].getErrorText())
            return res.redirect('/client/account/payments')

        }
    }
    try {
        const response = await changeSubscriptionTier(subscription, user.subscription.id)

    } catch (err) {
        req.flash('error', response.getMessages().getMessage()[0].getText())
        return res.redirect('/client/account/payments')
    }
    user.subscription.tier = subscription
    await user.save()
    console.log('subscription from req.body')
    console.log(subscription)
    res.redirect('/client/account/payments')
})

module.exports.changeSubscriptionPayment = catchAsync(async (req, res) => {
    const { payment } = req.body;
    const user = await User.findById(req.user._id)
    user.subscription.payment = payment
    await changeSubscriptionPayment(user.subscription.id, user.customerProfileId, payment)
    await user.save()
    res.redirect('/client/account/payments')

})

module.exports.cancelSubscription = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleteResponse = await cancelSubscription(id)
    const client = await User.findOne({ 'subscription.id': id })
    client.subscription.tier = 'NONE'
    client.save()
    console.log('found client for subscription deletion')
    console.log(client)
    res.redirect('/client/account/payments')
})

module.exports.address = catchAsync(async (req, res) => {
    res.locals.title = 'Addresses'
    res.locals.description = 'View and edit your addresses'
    const user = await User.findById(req.user._id).populate('packages').populate('addy');

    res.render('client/account/addresses', { user })
})

module.exports.sendEmail = async (req, res) => {
    const pkg = await Package.findById(req.body.id)
    console.log(pkg)
    const user = await User.findById(req.user._id)
    console.log(user)
    sendForwardConfirm({ pkg, user })
    res.redirect('/client/inbox/pending')

}


