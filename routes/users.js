const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const bcrypt = require('bcryptjs')

const router = express.Router();



router.get('/users/login', catchAsync(async(req,res,next) => {
    if (req.session.user_id) {
        return res.redirect('/users/info')
    }
    res.render('users/login')
}))

router.get('/users/signup',(req,res) => {
    res.render('users/signup')
})



router.post('/logout', (req,res) => {
    req.session.user_id = null;
    res.redirect('/')
})

router.post('/users/signup', async (req,res) => {
    const {email,password} = req.body
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        email,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    req.flash('success',`Saved user to DB: email: ${email} password: ${hash}`)
    res.redirect('/users/info')
    // res.send(`${email}   ${hash}`)
})

router.post('/users/login',async (req,res) => {
    const {email,password} = req.body
    const user = await User.findOne({email});
    if (!user) {
        req.flash('error', 'Info does not match a user')
        res.redirect('/users/login')    
    }
    if (await bcrypt.compare(password, user.password)){
        req.flash('success','Logged in')
        req.session.user_id = user._id
        res.redirect('/users/info')
    } else {
        req.flash('error', 'Info does not match a user')
        res.redirect('/users/login')
    }
})

router.use((req,res,next) => {
    if (req.session.user_id) {
        return next()
    }
    res.redirect('users/login')
})

router.get('/users/info',(req,res) => {
    res.render('users/info')
})

module.exports = router;