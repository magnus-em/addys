const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const router = express.Router();
const user = require('../controllers/user')
const {isUser} = require('../utils/middleware')
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


router.get('/user/inbox', isUser, user.inbox)
router.get('/user/inbox/pending', isUser, user.inboxPending)
router.get('/user/inbox/forwarded', isUser, user.inboxForwarded)

router.get('/user/inbox/:id/forward/address', isUser, user.addressForm)
router.get('/user/inbox/:id/forward/shipping', isUser, user.shippingForm)
router.get('/user/inbox/:id/forward/payment', isUser, user.paymentForm)
router.get('/user/inbox/:id/forward/overview', isUser, user.overviewForm)


router.post('/user/inbox/:id/forward', isUser, user.forward)

router.get('/user/account/personal',isUser, user.personal)
router.get('/user/account/security',isUser, user.security)
router.get('/user/account/payments',isUser, user.payments)
router.get('/user/account/addresses',isUser, user.address)
router.get('/user/account/notifications',isUser, user.notifications)



module.exports = router;   