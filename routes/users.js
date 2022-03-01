const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const bcrypt = require('bcryptjs')

const router = express.Router();

router.get('/users/login', catchAsync(async(req,res,next) => {
    res.render('users/login')
}))

router.get('/users/signup',(req,res) => {
    res.render('users/signup')
})


router.post('/users/signup', async (req,res) => {
    const {email,password} = req.body
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        email,
        password: hash
    })
    await user.save();
    req.flash('success',`Saved user to DB: email: ${email} password: ${hash}`)
    res.redirect('/users/login')
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
        res.redirect('/users/login')
    } else {
        req.flash('error', 'Info does not match a user')
        res.redirect('/users/login')
    }
})


module.exports = router;