const Addy = require('../models/addy')
const Review = require('../models/review')




module.exports.isClient = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type == 'CLIENT') {
        return next();
    } 
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Must be client')
    res.redirect('/login') 
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Must be logged in')
        return res.redirect('/login')
    } 
    next()
}

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type == 'ADMIN') {
        return next()
    } 
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Must be admin')
    res.redirect('/login') 
}

module.exports.isForwarder = (req,res,next) => {
    if (req.isAuthenticated() && req.user.type == 'FW') {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Must be forwarder')
    res.redirect('/login') 

}

// module.exports.isForwarder = async(req,res,next) => {
//     if (!req.isAuthenticated()) {
//         req.session.returnTo = req.originalUrl;
//         req.flash('error', 'Must be logged in')
//         return res.redirect('/login')
//     }
//     const {id} = req.params
//     const addy = await Addy.findById(id)
//     if (req.user.equals(addy.forwarder)){
//         next()
//     } else {
//         req.flash('error','You must be the Addy forwarder')
//         res.redirect(`/locations/${id}`)
//     }
// }

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
        res.redirect(`/locations/${addyId}`)
    }

}