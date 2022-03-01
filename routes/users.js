const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

const router = express.Router();



router.get('/login', catchAsync(async(req,res,next) => {
    res.render('users/login')
}))

router.get('/register',(req,res) => {
    res.render('users/register')
})


router.post('/register', catchAsync(async (req,res,next) => {
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
}))

router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}),async (req,res) => {
    // const {email,password} = req.body
    req.flash('success', 'welcome back')
    const redirectUrl = req.session.returnTo || '/addys'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})


router.get('/users/info',(req,res) => {
    res.render('users/info')
})

router.get('/logout',(req,res) => {
    req.logout()
    req.flash('success','Logged out')
    res.redirect('/login')
})

module.exports = router;