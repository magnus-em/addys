const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const express = require("express");
const passport = require('passport')


module.exports.renderLoginForm = async(req,res) => {
    res.render('users/login')
}

module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register')
}

module.exports.createUser = catchAsync(async (req,res,next) => {
    try {
        const {email,username,password} = req.body
        const user = new User({email,username})
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
        })
        req.flash('success', 'Account created')
        res.redirect('/register')
    } catch (err) {
        req.flash('error',err.message)
        res.redirect('/register')
    }
})

module.exports.login = catchAsync(async (req,res) => {
    req.flash('success', 'Logged in')
    const redirectUrl = req.session.returnTo || '/addys'
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