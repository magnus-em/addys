const express = require("express");
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const {validateReview, validateAddy} = require('../utils/validations')
const {isLoggedIn} = require('../utils/middleware')
const catchAsync = require('../utils/catchAsync')
const router = express.Router();
const packages = require('../controllers/packages')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})



//post new package tied to specific addy
router.post('/addys/:id/packages', isLoggedIn, upload.array('image'), packages.createPackage)

//get all packages and show all
router.get('/packages', packages.index)

// get package with specific id
router.get('/packages/:id',packages.showPackage)

//delete package under specific addy
router.delete('/addys/:addyId/packages/:packageId', isLoggedIn, packages.deletePackage)

// get form to create new package tied to addy
router.get('/addys/:id/packages/new', isLoggedIn, packages.renderNewForm)

module.exports = router;
