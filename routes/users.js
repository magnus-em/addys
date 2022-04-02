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
const bodyParser = require("body-parser");
const cors = require("cors");


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
    res.render('client/forward/fwAddress')
})

router.get('/logout', user.logout)

router.get('/clientform',(req,res) => {
    res.render('client/typeform')
})
router.get('/forwarderform',(req,res) => {
    res.render('forwarder/typeform')
})

router.get('/client/inbox/new', isClient, user.inbox)
router.get('/client/inbox/pending', isClient, user.inboxPending)
router.get('/client/inbox/forwarded', isClient, user.inboxForwarded)

router.get('/client/inbox/:id/forward/address', isClient, user.addressForm)
router.get('/client/inbox/:id/forward/shipping', isClient, user.shippingForm)
router.get('/client/inbox/:id/forward/payment', isClient, user.paymentForm)
router.get('/client/inbox/:id/forward/overview', isClient, user.overviewForm)

router.post('/client/inbox/:id/forward', isClient, user.forward)

router.post('/sendemail',isClient, user.sendEmail)

router.get('/client/account/personal',isClient, user.personal)
router.post('/client/account/personal', isClient, user.changeEmailPhone)
router.post('/client/account/personal/delete', isClient, user.deleteAccount) 

router.get('/client/account/security',isClient, user.security)
router.post('/client/account/security/reset', isClient, user.changePassword)


router.get('/client/account/payments',isClient, user.payments)
router.post('/client/account/payments', isClient, user.addPayment)
router.delete('/client/account/payments/:id', isClient, user.deletePayment)

router.get('/client/account/addresses',isClient, user.address)
router.post('/client/account/addresses', isClient, user.saveAddress)
router.delete('/client/account/addresses/:id', isClient, user.deleteAddress)

router.post('/client/account/subscription', isClient, user.changeSubscription)
router.post('/client/account/subscription/payment', isClient, user.changeSubscriptionPayment)
router.delete('/client/account/subscription/:id', isClient, user.cancelSubscription)


router.get('/successdemo',user.successDemo)


router.use(bodyParser.json());
router.use(bodyParser.text());
router.use(cors());

router.post('/verification/reviewed', user.verificationReviewed)
router.post("/passbase-webhooks", user.webhooks);
  





module.exports = router;   