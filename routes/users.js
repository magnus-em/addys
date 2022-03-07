const express = require("express");
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const router = express.Router();
const users = require('../controllers/users')
const {isUser} = require('../utils/middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


router

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}),
             users.login)

router.route('/register')
    .get(users.renderRegisterForm)
    .post(users.createUser)

router.get('/reset', users.resetForm)

router.get('/forward',(req,res) => {
    res.render('users/forward/fwAddress')
})

router.get('/logout', users.logout)


router.get('/user/inbox', isUser, users.inbox)
router.get('/user/inbox/pending', isUser, users.inboxPending)
router.get('/user/inbox/forwarded', isUser, users.inboxForwarded)

router.get('/user/inbox/:id/forward/address', isUser, users.addressForm)
router.get('/user/inbox/:id/forward/shipping', isUser, users.shippingForm)
router.get('/user/inbox/:id/forward/payment', isUser, users.paymentForm)
router.get('/user/inbox/:id/forward/overview', isUser, users.overviewForm)


router.post('/user/inbox/:id/forward', isUser, users.forward)



module.exports = router;   