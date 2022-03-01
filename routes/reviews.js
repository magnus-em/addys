const express = require("express");
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const {validateReview, validateAddy} = require('../utils/validations')
const {isLoggedIn, isAuthor} = require('../utils/middleware')
const reviews = require('../controllers/reviews')

const catchAsync = require('../utils/catchAsync')
const router = express.Router({mergeParams: true});

router.get('/new', isLoggedIn, reviews.renderNewForm)

router.post('/', isLoggedIn, validateReview, reviews.createReview)

router.delete('/:reviewId', isAuthor, reviews.deleteReview)

module.exports = router;