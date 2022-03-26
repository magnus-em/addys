const Addy = require("../models/addy")
const Package = require("../models/package")
const { Payout } = require("../models/payout")
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")

module.exports.overview = catchAsync(async (req,res) => {
    res.render('admin/overview')
})

module.exports.all = catchAsync( async (req,res) => {
    const packages = await Package.find({})
    res.render('admin/dash/all', {packages})
})
module.exports.new = catchAsync( async (req,res) => {
    const packages = await Package.find({})
    res.render('admin/dash/new', {packages})
})
module.exports.pending = catchAsync( async (req,res) => {
    const packages = await Package.find({})
    res.render('admin/dash/pending', {packages})
})
module.exports.forwarded = catchAsync( async (req,res) => {
    const packages = await Package.find({})
    res.render('admin/dash/forwarded', {packages})
})

module.exports.newFwForm = (req,res) => {
    res.render('admin/fwRegister')
}

module.exports.createFw = catchAsync(async (req,res) => {
    try {
        const {email,username,password,addyId,firstName,lastName, phone, invite} = req.body
        const addy = await Addy.findById(addyId)
        console.log(addy)
        const fw = new User({email,username,addy,firstName,lastName,phone,invite, type: 'FW'})
        addy.forwarder = fw._id;
        await addy.save()
        const registeredUser = await User.register(fw,password)
        req.flash('success', 'Forwarder created')
        res.redirect('/admin')
    } catch (err) {
        req.flash('error', err.message)
        console.log('in the createFw error handler', err.stack)
    }
})

module.exports.deletePackage = catchAsync(async (req,res) => {
    const {id} = req.params
    const pkg = await Package.findByIdAndDelete(id)
    console.log('deleted package: ' + pkg)
    res.redirect('/admin/dash/all')
})


module.exports.allClients = catchAsync(async (req,res) => {
    const clients = await User.find({}).populate('addy')
    res.render('admin/clients', {clients})
})

module.exports.indexPendingPayouts = catchAsync(async(req,res) => {
    const forwarders = await User.find({type: 'FW'})
    res.render('admin/indexes/pendingPayouts', {forwarders})
})

module.exports.submitPayout = catchAsync(async(req,res) => {
    const {id} = req.body
    const {type, username, name, transaction, amount} = req.body
    const payout = new Payout({type,username,name,transaction,amount})
    const fw = await User.findById()
    res.redirect('/admin/fw/pendingpayouts')
})

module.exports.createAddy = catchAsync(async(req,res) => {
    const newAddy = new Addy(req.body)
    console.log('new addy')
    console.log(newAddy)
    await newAddy.save()
    req.flash('success','Successfully created Addy')
    res.redirect('/locations')

})

module.exports.security = catchAsync(async (req,res) => {
    res.locals.title = 'Security'
    res.locals.description = 'View and edit your security info'
    const user = await User.findById(req.user._id).populate('addy')
    res.render('admin/account/security', {user})
})
module.exports.changePassword = catchAsync(async (req, res) => {
    const { password } = req.body
    const user = await User.findById(req.user._id)
    await user.setPassword(password)
    user.save()
    req.flash('success', 'Successfully changed password :)')
    res.redirect('/admin/account/security')
})