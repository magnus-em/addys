const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const Package = require('../models/package')
const Addy = require('../models/addy')


module.exports.landing = (req,res) => {
    res.locals.title = 'Get Paid to Forward Packages From Your Home'
    res.locals.description = 'Become a package forwarder and turn your home address into side income. Earn $15 dollars per package plus extras. Paid out weekly.'
    res.render('forwarder/landing')
}

module.exports.inbox = catchAsync(async (req,res) => {
    const user = await User.findById(req.user._id).populate({path: 'addy', populate: {path: 'packages'}})
    res.render('forwarder/inbox', {user})
})

module.exports.uploadForm = (req,res) => {
    res.render('forwarder/upload')
}

module.exports.upload = catchAsync(async (req,res) => {
    const package = new Package(req.body.package)
    const user = await User.findById(req.user._id).populate({
                    path: 'addy',
                    populate: {
                        path: 'packages'
                    }});

    // add reference to package on client by matching mailbox number and addy tied to current user (forwarder)
    const client = await User.findOne({addy: user.addy._id, mailbox: package.mailbox}).populate('packages')
    client.packages.push(package)
    await client.save()

    // set reference on package to addy by finding addy tied to current user
    // set images on url and filename processed via multer plus cloudinary
    const addy = await Addy.findById(user.addy)
    package.addy = user.addy;
    package.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    await package.save();

    // set reference on addy to new package
    addy.packages.push(package)
    await addy.save()               

    res.redirect('/forwarder/inbox')
})
