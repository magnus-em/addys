const express = require("express");
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const {validateReview, validateAddy} = require('../utils/validations')
const catchAsync = require('../utils/catchAsync')
const router = express.Router({mergeParams: true});

router.get('/new', async (req,res) => {
    const {addyId} = req.params;
    console.log(addyId)
    console.log('in the review router getter')
    const addy = await Addy.findById(addyId);
    res.render('reviews/new', {addy})
})

router.post('/', validateReview, async (req,res) => {
    const addy = await Addy.findById(req.params.addyId);
    const review = new Review(req.body.review)
    console.log('NEW REVIEW')
    console.log(review)
    addy.reviews.push(review)
    await review.save()
    await addy.save();
    req.flash('success','Posted review')
    res.redirect(`/addys/${addy._id}/`)
})

router.delete('/:reviewId', catchAsync(async(req,res) => {
    const {addyId, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Addy.findByIdAndUpdate(addyId,{$pull: {reviews: reviewId}})
    req.flash('success','Deleted review')
    res.redirect(`/addys/${addyId}/`)
}))

module.exports = router;