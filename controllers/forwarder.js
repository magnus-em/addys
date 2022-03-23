const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const Package = require('../models/package')
const Addy = require('../models/addy')
const moment = require('moment')
const { sendClientPackageDroppedOff, sendClientNewPackageArrived } = require("../sendgrid")

module.exports.landing = (req,res) => {
    res.locals.title = 'Get Paid to Forward Packages From Your Home'
    res.locals.description = 'Become a package forwarder and turn your home address into side income. Earn $15 dollars per package plus extras. Paid out weekly.'
    res.render('forwarder/landing')
}

module.exports.pending = catchAsync(async (req,res) => {
    res.locals.title = 'Ready to ship'
    res.locals.description = 'Packages that are ready to label and drop off'

    const user = await User.findById(req.user._id).populate({path: 'addy', populate: {path: 'packages'}})
    res.render('forwarder/dash/pending', {user})
})

module.exports.new = catchAsync(async (req,res) => {
    res.locals.title = 'Awaiting'
    res.locals.description = 'Packages that are awaiting a client to submit a forward request'

    const user = await User.findById(req.user._id).populate({path: 'addy', populate: {path: 'packages'}})
    res.render('forwarder/dash/new', {user})
})

module.exports.forwarded = catchAsync(async (req,res) => {
    res.locals.title = 'Forwarded'
    res.locals.description = 'Packages that you have forwarded in the past'

    const user = await User.findById(req.user._id).populate({path: 'addy', populate: {path: 'packages'}})
    res.render('forwarder/dash/forwarded', {user})
})

module.exports.uploadForm = async (req,res) => {
    res.locals.title = 'Upload Package'
    res.locals.description = 'Upload a new package to your dashboard'

    const addy = await Addy.findById(req.user.addy._id).populate('clients')
    console.log('found addy', addy)

    res.render('forwarder/upload', {addy})
}

module.exports.upload = catchAsync(async (req,res) => {
    const package = new Package(req.body.package)
    package.status = 'NEW'
    const forwarder = await User.findById(req.user._id).populate({
                    path: 'addy',
                    populate: {
                        path: 'packages'
                    }});

    // add reference to package on client by matching mailbox number and addy tied to current user (forwarder)
    const client = await User.findOne({addy: forwarder.addy._id, mailbox: package.mailbox}).populate('packages')
    client.packages.push(package)
    await client.save()

    // set reference on package to addy by finding addy tied to current user
    // set images on url and filename processed via multer plus cloudinary
    const addy = await Addy.findById(forwarder.addy)
    package.addy = addy;
    package.client = client;
    package.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    await package.save();

    // set reference on addy to new package
    addy.packages.push(package)
    await addy.save()              
    req.flash('success', 'successfully uploaded package') 

    //send email to client regarding new package
    sendClientNewPackageArrived(package, client)

    res.redirect('/forwarder/dash/new')
})

module.exports.uploadReceipt = catchAsync(async (req,res) => {
    const id = req.body.pkgId
    console.log(id)
    const package = await Package.findById(id)
    package.receipts = req.files.map(f => ({url: f.path, filename: f.filename}))
    package.status = 'FORWARDED'
    package.forwardedDate = Date.now()
    await package.save();
    const fw = await User.findById(req.user._id)
    fw.balance += 15;
    await fw.save();
    const client = await User.findById(package.client)
    sendClientPackageDroppedOff({pkg: package, user: client})
    req.flash('success', 'Drop off confirmed & $15 added to balance')
    res.redirect('/forwarder/dash/forwarded')
})

module.exports.personal = catchAsync(async (req,res) => {
    res.locals.title = 'Personal'
    res.locals.description = 'View and edit your personal info'


    res.render('forwarder/account/personal')
})

module.exports.security = catchAsync(async (req,res) => {
    res.locals.title = 'Security'
    res.locals.description = 'View and edit your security info'


    res.render('forwarder/account/security')
})

module.exports.payments = catchAsync(async (req,res) => {
    res.locals.title = 'Payments'
    res.locals.description = 'View and edit your payment methods'


    const fw = await User.findById(req.user._id).populate('addy')
    const addy = await Addy.findById(fw.addy._id).populate('clients').populate('packages')
    fw.addy = addy;
    console.log('fw: ' + fw)
    console.log('addy: ' + addy)

    const today = moment();
    const weekStart = today.startOf('week').toDate()
    const weekEnd = today.endOf('week').toDate()
    console.log(weekStart)
    console.log(weekEnd)
    const weekPkgs = await Package.find({
        forwardedDate: {
            $gte: weekStart,
            $lte: weekEnd
        }
    })

    console.log('forwarded last week' + weekPkgs)
    res.render('forwarder/account/payments', {fw, moment, weekPkgs})
})

module.exports.addPayoutMethod = catchAsync(async(req,res) => {
    const {type, username, primary, name} = req.body
    const fw = await User.findById(req.user._id)
    let prim = false;
    if (primary) {
        prim = true
        for (let p of fw.payouts) {
            p.isPrimary = false;
        }
    }
    const newPayout = {type, username, name, isPrimary:prim }
    fw.payouts.push(newPayout)
    await fw.save();
    res.redirect('/forwarder/account/payments')
})

module.exports.deletePayoutMethod = catchAsync(async(req,res) => {
    const {id} = req.params;
    console.log(id)
    const fw = await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            payouts: {_id : id}
        }
    });
    res.redirect('/forwarder/account/payments')
})


module.exports.clients = catchAsync(async (req,res) => {
    const user = await User.findById(req.user._id).populate({path: 'addy', populate: {path: 'packages'}})
    const addy = await Addy.findById(user.addy._id).populate('clients')
    user.clients = addy.clients;

    res.render('forwarder/dash/clients', {user})
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
    } else if (email) {
        user.email = email
        req.flash('success', 'Successfully changed email')
    }
    await user.save()
    res.redirect('/forwarder/account/personal')
})