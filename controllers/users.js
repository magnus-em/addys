const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')
const {getShipment} = require('../shippo/test')
const shippo = require('shippo')(process.env.SHIPPO_TEST);


module.exports.renderLoginForm = async(req,res) => {
    res.render('users/login')
}

module.exports.renderRegisterForm = catchAsync(async (req,res) => {
    console.log(req.query.addy)
    if (!req.query.addy) {
        return res.redirect('/addys')
    }
    const addy = await Addy.findById(req.query.addy)
    res.render('users/register', {addy})
})

module.exports.resetForm = (req,res) => {
    res.render('users/resetPw')
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
        res.redirect('/user/inbox')
    } catch (err) {
        req.flash('error',err.message)
        console.log('in the users.createUser error handler', err.stack)
        res.redirect(`/register?addy=${req.body.addy}`)
    }
})

module.exports.login = catchAsync(async (req,res) => {
    req.flash('success', 'Logged in')
    if (req.user.isAdmin) {
        return res.redirect('/admin')
    } else if (req.user.isForwarder) {
        return res.redirect('/forwarder/inbox')
    }
    // const redirectUrl = req.session.returnTo || '/user/inbox'
    const redirectUrl = '/user/inbox'
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
    res.render('users/inbox', {user})
}))
module.exports.inboxPending = catchAsync((async (req,res) => {
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('users/inboxPending', {user})
}))
module.exports.inboxForwarded = catchAsync((async (req,res) => {
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('users/inboxForwarded', {user})
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
//     res.render('users/forward/forwardThreePayment', {user} )
// })

module.exports.addressForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('users/forward/fwAddress', {user})
})

module.exports.shippingForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    user.shipment = await getShipment();
    res.render('users/forward/fwShipping', {user})
})

module.exports.paymentForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('users/forward/fwPayment', {user})
})

module.exports.overviewForm = catchAsync(async(req,res) => {
    const {id} = req.params
    const pkg = await Package.findById(id)
    const addy = await Addy.findById(req.user.addy._id)
    const user = await User.findById(req.user._id).populate('addy')
    user.pkg = pkg;
    res.render('users/forward/fwOverview', {user})
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


