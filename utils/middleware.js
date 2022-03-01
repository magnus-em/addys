const Addy = require('../models/addy')
const Review = require('../models/review')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Must be logged in')
        return res.redirect('/login')
    }
    next()
}

module.exports.isForwarder = async(req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Must be logged in')
        return res.redirect('/login')
    }
    const {id} = req.params
    const addy = await Addy.findById(id)
    if (req.user.equals(addy.forwarder)){
        next()
    } else {
        req.flash('error','You must be the Addy forwarder')
        res.redirect(`/addys/${id}`)
    }
}

module.exports.isAuthor = async(req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Must be logged in')
        return res.redirect('/login')
    }
    const {addyId, reviewId} = req.params;
    const addy = await Addy.findById(addyId)
    const review = await Review.findById(reviewId)
    if (req.user.equals(review.author)){
         next()
    } else {
        req.flash('error','You must be the review author')
        res.redirect(`/addys/${addyId}`)
    }

}