const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')
const {getShipment} = require('../shippo/test')
const shippo = require('shippo')(process.env.SHIPPO_TEST);


module.exports.renderLoginForm = async(req,res) => {
    res.render('user/login')
}

module.exports.renderRegisterForm = catchAsync(async (req,res) => {
    console.log(req.query.addy)
    if (!req.query.addy) {
        return res.redirect('/addys')
    }
    const addy = await Addy.findById(req.query.addy)
    res.render('user/register', {addy})
})

module.exports.resetForm = (req,res) => {
    res.render('user/resetPw')
}

module.exports.createUser = catchAsync(async (req,res,next) => {
    try {
        if (req.body.invite != 69420) {
            throw new Error('Invalid invite code')
        }
        const {email,username,password} = req.body
        const addy = await Addy.findById(req.body.addy).populate('users')
        const mailbox = addy.users.length + 33; // make it seem like there are more people reshipping
        const user = new User({email,username,addy, mailbox})
        await addy.users.push(user._id)     // if you pass in just the user object here, mongoose goes into a recursive error.
        await addy.save()
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
        })
        req.flash('success', 'Account created')
        console.log('NEW USER CREATED')
        console.log(user)
        res.redirect('/user/inbox/new')
    } catch (err) {
        req.flash('error',err.message)
        console.log('in the user.createUser error handler', err.stack)
        res.redirect(`/register?addy=${req.body.addy}`)
    }
})

module.exports.login = catchAsync(async (req,res) => {
    req.flash('success', 'Logged in')
    if (req.user.isAdmin) {
        return res.redirect('/admin')
    } else if (req.user.isForwarder) {
        return res.redirect('/forwarder/dash/requested')
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
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('user/inbox/new', {user})
}))
module.exports.inboxPending = catchAsync((async (req,res) => {
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('user/inbox/pending', {user})
}))
module.exports.inboxForwarded = catchAsync((async (req,res) => {
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
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('user/forward/fwAddyNew', {user})
})

module.exports.shippingForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    user.shipment = await getShipment();
    res.render('user/forward/fwShippingNew', {user})
})

module.exports.paymentForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('user/forward/fwPaymentNew', {user})
})

module.exports.overviewForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('user/forward/fwOverviewNew', {user})
})


module.exports.forward = catchAsync(async (req,res) => {
    const {id} = req.params
    const {rateId, shipmentId} = req.body
    console.log(rateId)
    console.log(shipmentId)
    const shipment = await shippo.shipment.retrieve(shipmentId)
    console.log(shipment.status)
    // console.log('shipment: ')
    // console.log(shipment)
    const pkg = await Package.findById(id);
    console.log(req.body)
    res.send(req.body)
})


module.exports.personal = catchAsync(async (req,res) => {
    res.render('user/account/personal')
})

module.exports.security = catchAsync(async (req,res) => {
    res.render('user/account/security')
})

module.exports.payments = catchAsync(async (req,res) => {
    res.render('user/account/payments')
})

module.exports.address = catchAsync(async (req,res) => {
    res.render('user/account/addresses')
})

module.exports.forwards = catchAsync(async (req,res) => {
    res.render('user/account/forwards')
})

module.exports.preferences = catchAsync(async (req,res) => {
    res.render('user/account/preferences')
})

module.exports.notifications = catchAsync(async (req,res) => {
    res.render('user/account/notifications')
})

