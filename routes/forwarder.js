const express = require('express');
const router = express.Router({mergeParams: true});
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const {isForwarder} = require('../utils/middleware')

const fw = require('../controllers/forwarder')

router.route('/')
    .get(fw.landing)

router.route('/inbox')
    .get(isForwarder, fw.inbox)

router.route('/upload')
    .get(isForwarder, fw.uploadForm)
    .post(isForwarder, upload.array('image'), fw.upload)


module.exports = router;