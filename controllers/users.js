const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Package = require('../models/package')
const Addy = require('../models/addy')


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

module.exports.createUser = catchAsync(async (req,res,next) => {
    try {
        if (req.body.invite != 69420) {
            throw new Error('Invalid invite code')
        }
        const {email,username,password} = req.body
        const addy = await Addy.findById(req.body.addy).populate('users')
        const mailbox = addy.users.length + 30; // make it seem like there are more people reshipping
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
    const redirectUrl = req.session.returnTo || '/user/inbox'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

module.exports.showUser = (req,res) => {
    res.render('users/info')
}

module.exports.logout = (req,res) => {
    req.logout()
    req.flash('success','Logged out')
    res.redirect('/login')
}

module.exports.inbox = catchAsync((async (req,res) => {
    console.log('USER: ' + req.user)
    const user = await User.findById(req.user._id).populate('packages').populate('addy');
    res.render('users/inbox', {user})
}))

module.exports.uploadForm = (req,res) => {
    res.render('users/upload')
}

module.exports.upload = catchAsync(async (req,res) => {
    const user = await User.findById(req.user._id).populate('packages');
    const package = new Package(req.body.package)
    user.packages.push(package)
    package.user = user;
    package.addy = user.addy
    package.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    await package.save()
    await user.save()
    console.log('NEW PACKAGE')
    console.log(package)
    res.redirect('/user/inbox')

})