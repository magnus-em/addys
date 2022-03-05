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

router.get('/logout', users.logout)

router.get('/users/info',users.showUser)

router.get('/user/inbox', isUser, users.inbox)

router.route('/user/upload')
    .get(isUser, users.uploadForm)
    .post(isUser, upload.array('image'), users.upload)



module.exports = router;   