const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')
const {getShipment, createTransaction} = require('../shippo/test')
const shippo = require('shippo')(process.env.SHIPPO_TEST);


module.exports.renderLoginForm = async(req,res) => {
    res.locals.title = "Addys Login"
    res.locals.description = "Login to manage your packages"
    res.render('user/login')
}

module.exports.renderRegisterForm = catchAsync(async (req,res) => {
    res.locals.title = "Sign up for Addys"
    res.locals.description = "Sign up to start using residential addresses to forward you packages"
    console.log(req.query.addy)
    if (!req.query.addy) {
        return res.redirect('/addys')
    }
    const addy = await Addy.findById(req.query.addy)
    res.render('user/register/register', {addy})
})



module.exports.resetForm = (req,res) => {
    res.locals.title = "Reset password"
    res.locals.description = "Can't remember your password? No worries, just complete this easy form."

    res.render('user/resetPw')
}

module.exports.createUser = catchAsync(async (req,res,next) => {
    try {
        if (req.body.invite != 69420) {
            throw new Error('Invalid invite code')
        }
        const {email,username,password, invite} = req.body
        const addy = await Addy.findById(req.body.addy).populate('clients')
        const mailbox = addy.clients.length + 33; // make it seem like there are more people reshipping
        const user = new User({email,username,addy, mailbox, type: 'CLIENT', invite})
        await addy.clients.push(user._id)     // if you pass in just the user object here, mongoose goes into a recursive error.
        await addy.save()
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
        })
        console.log('NEW USER CREATED')
        console.log(user)
        res.render('user/register/success', {user})
    } catch (err) {
        req.flash('error',err.message)
        console.log('in the user.createUser error handler', err.stack)
        res.redirect(`/register?addy=${req.body.addy}`)
    }
})

module.exports.login = catchAsync(async (req,res) => {
    if (req.user.type == 'ADMIN') {
        return res.redirect('/admin/dash/all')
    } else if (req.user.type == 'FW') {
        return res.redirect('/forwarder/dash/pending')
    }
    // const redirectUrl = req.session.returnTo || '/user/inbox/new'
    const redirectUrl = '/user/inbox/new'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})



module.exports.logout = (req,res) => {
    req.logout()
    req.flash('success','Logged out')
    res.redirect('/login')
}

module.exports.inbox = catchAsync((async (req,res) => {
    res.locals.title = "New packages"
    res.locals.description = "Newly uploaded packages that are ready for you to submit a forward request"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('user/inbox/new', {user})
}))
module.exports.inboxPending = catchAsync((async (req,res) => {
    res.locals.title = "Pending"
    res.locals.description = "Packages that been forward requested and are awaiting drop off by your forwarder"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('user/inbox/pending', {user})
}))
module.exports.inboxForwarded = catchAsync((async (req,res) => {
    res.locals.title = "Forwarded"
    res.locals.description = "Packages that have been forwarded"
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('user/inbox/forwarded', {user})
}))

// module.exports.forwardForm = catchAsync(async (req,res) => {
//     const {id} = req.params
//     const pkg = await Package.findById(id);
//     const addy = await Addy.findById(req.user.addy._id)
//     const user = await User.findById(req.user._id).populate('addy')
//     user.pkg = pkg;
//     user.shipment = await getShipment();
//     console.log('USER RATES')
//     console.log(user.shipment)
//     res.render('user/forward/forwardThreePayment', {user} )
// })

module.exports.addressForm = catchAsync(async(req,res) => {
    res.locals.title = 'Choose Address'
    res.locals.description = "Choose which address you'd like to ship your package to"

    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('user/forward/address', {user})
})

module.exports.saveAddress = catchAsync(async (req,res) => {
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
    res.redirect('/user/account/addresses')
})

module.exports.deleteAddress = catchAsync(async(req,res) => { 
    const user = await User.findById(req.user._id)
    const index = req.params.id  -1 ;
    console.log(index)
    console.log(user.addresses[index])
    user.addresses.splice(index, 1)
    await user.save()
    res.redirect('/user/account/addresses')
})

module.exports.shippingForm = catchAsync(async(req,res) => {
    res.locals.title = 'Choose Shipping'
    res.locals.description = 'Choose your preferred shipping service'

    const {id} = req.params
    console.log(req.query)
    res.locals.query = req.query
    const user = await User.findById(req.user._id).populate('addy')
    const address = await user.addresses.id(req.query.address)
    console.log(address)
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    user.pkg = pkg;
    user.shipment = await getShipment(address);
    res.render('user/forward/shipping', {user})
})

module.exports.paymentForm = catchAsync(async(req,res) => {
    res.locals.title = 'Choose Payment'
    res.locals.description = 'Choose the payment method you want to use to pay for your label and forward fee'

    res.locals.query = req.query
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('user/forward/payment', {user})
})

module.exports.overviewForm = catchAsync(async(req,res) => {
    res.locals.title = 'Overview'
    res.locals.description = 'Overview your forward request details'

    res.locals.query = req.query
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;



    res.render('user/forward/overview', {user})
})


module.exports.forward = catchAsync(async (req,res) => {
    const {id} = req.params
    const {rate} = req.query

    const user = await User.findById(req.user._id).populate('addy')
    const address = await user.addresses.id(req.body.address)
    // const shipment = getShipment(address)
    console.log('body.rate')
    console.log(req.body.rate)
    console.log(req.body.shipment)
    const trx = await createTransaction(req.body.rate)
    console.log(trx)
    const pkg = await Package.findById(id);
    pkg.shippo = trx;
    pkg.label_url = trx.label_url;
    pkg.tracking_number = trx.tracking_number;
    pkg.tracking_url_provider = trx.tracking_url_provider;
    pkg.status = 'PENDING'
    pkg.save()
    console.log(pkg)
    console.log(req.body)
    res.redirect('/user/inbox/new')
})


module.exports.personal = catchAsync(async (req,res) => {
    res.locals.title = 'Personal info'
    res.locals.description = 'View and edit your personal information'

    res.render('user/account/personal')
})

module.exports.security = catchAsync(async (req,res) => {
    res.locals.title = 'Security'
    res.locals.description = 'View and edit your security information'

    res.render('user/account/security')
})

module.exports.payments = catchAsync(async (req,res) => {
    res.locals.title = 'Payments'
    res.locals.description = 'View and edit your payment methods'
    res.render('user/account/payments')
})

module.exports.address = catchAsync(async (req,res) => {
    res.locals.title = 'Addresses'
    res.locals.description = 'View and edit your addresses'
    res.render('user/account/addresses')
})



