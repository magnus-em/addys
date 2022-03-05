const Addy = require("../models/addy")
const Forwarder = require('../models/forwarder')
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")

module.exports.index = (req,res) => {
    res.render('admin/index')
}

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
