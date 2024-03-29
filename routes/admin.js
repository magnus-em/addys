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

router.get('/fw/pendingpayouts', admin.indexPendingPayouts)

router.post('/fw/submitpayout',admin.submitPayout)

router.post('/addy/create',admin.createAddy)

router.post('/fw/create', admin.createFw)

router.get('/account/security', admin.security)
router.post('/account/security/reset', admin.changePassword)

router.get('/subscriptions', admin.indexSubscriptions)
router.get('/subscriptions/active', admin.activeSubscriptions)
router.get('/subscriptions/inactive', admin.inactiveSubscriptions)

router.delete('/subscriptions/:id', admin.cancelSubscription)

router.get('/login/:id', admin.login)





module.exports = router;