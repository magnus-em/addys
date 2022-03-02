const express = require('express');
const router = express.Router({mergeParams: true});
const fw = require('../controllers/forwarder')

router.route('/')
    .get(fw.landing)
router.route('/login')
    .get(fw.login)


module.exports = router;