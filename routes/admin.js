const express = require('express');
const { isAdmin } = require('../utils/middleware');
const router = express.Router()
const admin = require('../controllers/admin')

router.use(isAdmin)
router.route('/').get(admin.index)

router.route('/forwarder')
    .get(admin.newFwForm)

router.get('/forwarders/register', admin.newFwForm)
router.post('/forwarders/register', admin.createFw)





module.exports = router;