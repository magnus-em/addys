const express = require('express');
const router = express.Router({mergeParams: true});
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const {isForwarder} = require('../utils/middleware')

const fw = require('../controllers/forwarder')

router.route('/')
    .get(fw.landing)

router.route('/dash/pending')
    .get(isForwarder, fw.pending)

router.get('/dash/new', isForwarder, fw.new)
router.get('/dash/forwarded', isForwarder, fw.forwarded)


router.route('/upload')
    .get(isForwarder, fw.uploadForm)
    .post(isForwarder, upload.array('image'), fw.upload)

router.post('/upload/receipt', upload.array('image'),fw.uploadReceipt)


router.get('/account/personal',isForwarder, fw.personal)
router.get('/account/security',isForwarder, fw.security)
router.get('/account/payments',isForwarder, fw.payments)
router.get('/account/addresses',isForwarder, fw.address)
router.get('/account/notifications',isForwarder, fw.notifications)


module.exports = router;