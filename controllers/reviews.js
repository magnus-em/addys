const Addy = require('../models/addy')
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')


module.exports.renderNewForm = async (req,res) => {
    const {addyId} = req.params;
    console.log(addyId)
    const addy = await Addy.findById(addyId);
    res.render('reviews/new', {addy})
}

module.exports.createReview = catchAsync(async (req,res) => {
    const addy = await Addy.findById(req.params.addyId);
    const review = new Review(req.body.review)
    review.author = req.user;
    addy.reviews.push(review)
    await review.save()
    await addy.save();
    req.flash('success','Posted review')
    res.redirect(`/addys/${addy._id}/`)
})

module.exports.deleteReview = catchAsync(async(req,res) => {
    const {addyId, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Addy.findByIdAndUpdate(addyId,{$pull: {reviews: reviewId}})
    req.flash('success','Deleted review')
    res.redirect(`/addys/${addyId}/`)
})