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

router.get('/dash/clients', isForwarder, fw.clients)


router.route('/upload')
    .get(isForwarder, fw.uploadForm)
    .post(isForwarder, upload.array('image'), fw.upload)

router.post('/upload/receipt', upload.array('image'),fw.uploadReceipt)


router.get('/account/personal',isForwarder, fw.personal)
router.post('/account/personal', isForwarder, fw.changeEmailPhone)

router.get('/account/security',isForwarder, fw.security)
router.post('/account/security/reset', isForwarder, fw.changePassword)


router.get('/account/payments',isForwarder, fw.payments)
router.post('/account/payments', isForwarder, fw.addPayoutMethod)
router.post('/account/payments/primary/:id', isForwarder, fw.makePayoutPrimary)
router.delete('/account/payments/:id', isForwarder, fw.deletePayoutMethod)



module.exports = router;