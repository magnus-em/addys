const express = require("express");
const Addy = require('../models/addy')
const {validateAddy} = require('../utils/validations')
const {isLoggedIn, isForwarder} = require('../utils/middleware')
const addys = require('../controllers/addys')
const catchAsync = require('../utils/catchAsync')
const router = express.Router();


router.route('/')
    .get(addys.index)
    .post(isLoggedIn, validateAddy, addys.createAddy)

//get new addy form
router.get('/new', isLoggedIn, addys.renderNewform)



router.route('/:id')
    .get(addys.showAddy)
    .patch( validateAddy, addys.updateAddy)
    .delete( addys.deleteAddy)

router.get('/:id/edit', addys.renderEditForm)

router.get('/:id/inbox', isLoggedIn, addys.showInbox)

module.exports = router;