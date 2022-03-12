const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const router = express.Router();
const user = require('../controllers/user')
const {isClient} = require('../utils/middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


router

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}),
             user.login)

router.route('/register')
    .get(user.renderRegisterForm)
    .post(user.createUser)




router.get('/reset', user.resetForm)

router.get('/forward',(req,res) => {
    res.render('user/forward/fwAddress')
})

router.get('/logout', user.logout)

router.get('/clientform',(req,res) => {
    res.render('user/typeform')
})
router.get('/forwarderform',(req,res) => {
    res.render('forwarder/typeform')
})

router.get('/user/inbox/new', isClient, user.inbox)
router.get('/user/inbox/pending', isClient, user.inboxPending)
router.get('/user/inbox/forwarded', isClient, user.inboxForwarded)

router.get('/user/inbox/:id/forward/address', isClient, user.addressForm)
router.get('/user/inbox/:id/forward/shipping', isClient, user.shippingForm)
router.get('/user/inbox/:id/forward/payment', isClient, user.paymentForm)
router.get('/user/inbox/:id/forward/overview', isClient, user.overviewForm)


router.post('/user/inbox/:id/forward', isClient, user.forward)

router.get('/user/account/personal',isClient, user.personal)
router.get('/user/account/security',isClient, user.security)
router.get('/user/account/payments',isClient, user.payments)

router.get('/user/account/addresses',isClient, user.address)
router.post('/user/account/addresses', isClient, user.saveAddress)
router.delete('/user/account/addresses/:id', isClient, user.deleteAddress)




module.exports = router;   