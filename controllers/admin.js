const Addy = require("../models/addy")
const Package = require("../models/package")
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
        const {email,username,password,addyId,firstName,lastName} = req.body
        const addy = await Addy.findById(addyId)
        console.log(addy)
        const fw = new User({email,username,addy,firstName,lastName, type: 'FW'})
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
