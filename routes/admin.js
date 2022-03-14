const express = require('express');
const { isAdmin } = require('../utils/middleware');
const router = express.Router()
const admin = require('../controllers/admin')

router.use(isAdmin)
router.route('/').get(admin.overview)

router.get('/clients', admin.allClients)

router.route('/dash/all').get(admin.all)
router.get('/dash/new', admin.new)
router.get('/dash/pending',admin.pending)
router.get('/dash/forwarded', admin.forwarded)

router.route('/forwarder')
    .get(admin.newFwForm)

router.get('/forwarders/register', admin.newFwForm)
router.post('/forwarders/register', admin.createFw)

router.delete('/package/:id', admin.deletePackage)





module.exports = router;