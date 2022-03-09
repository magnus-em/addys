const Addy = require("../models/addy")
const Package = require("../models/package")
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")

module.exports.all = catchAsync( async (req,res) => {
    const packages = await Package.find({})
    res.render('admin/dash/all', {packages})
})

module.exports.newFwForm = (req,res) => {
    res.render('admin/fwRegister')
}

module.exports.createFw = catchAsync(async (req,res) => {
    try {
        const {email,username,password,addyId,firstName,lastName} = req.body
        const addy = await Addy.findById(addyId)
        console.log(addy)
        const user = new User({email,username,addy,firstName,lastName, isForwarder: true})
        addy.forwarder = user._id;
        await addy.save()
        const registeredUser = await User.register(user,password)
        req.flash('success', 'Forwarder created')
        console.log('NEW FORWARDER (Type User) CREATED')
        console.log(user)
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
    res.redirect('/admin/dash/')
})
