const express = require('express');
const { isAdmin } = require('../utils/middleware');
const router = express.Router()
const admin = require('../controllers/admin')

router.use(isAdmin)
router.route('/').get(admin.all)

router.route('/dash').get(admin.all)

router.route('/forwarder')
    .get(admin.newFwForm)

router.get('/forwarders/register', admin.newFwForm)
router.post('/forwarders/register', admin.createFw)

router.delete('/package/:id', admin.deletePackage)





module.exports = router;