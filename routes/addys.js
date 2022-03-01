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



// show details for specific addy
router.get('/:id', addys.showAddy)

//update specific addy
router.patch('/:id', isForwarder, validateAddy, addys.updateAddy)

// delete specific addy
router.delete('/:id', isForwarder, addys.deleteAddy)

//get edit form for specific addy
router.get('/:id/edit', isForwarder, addys.renderEditForm)

module.exports = router;