const express = require("express");
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const {validateReview, validateAddy} = require('../utils/validations')
const {isLoggedIn} = require('../utils/middleware')
const catchAsync = require('../utils/catchAsync')
const router = express.Router();


//post new package tied to specific addy
router.post('/addys/:id/packages', isLoggedIn, catchAsync(async(req,res,next) => {
    const {id} = req.params
    const addy = await Addy.findById(id).populate('packages')
    const package = new Package(req.body.package)
    await addy.packages.push(package)
    package.addy = addy;
    await addy.save()
    await package.save()
    console.log('NEW PACKAGE')
    console.log(package)
    req.flash('success','Successfully added package')
    // res.render('addys/details', {addy, message: req.flash('success')})
    res.redirect(`/addys/${id}`)
}))

//get all packages and show all
router.get('/packages',catchAsync(async(req,res,next) => {
    const packages = await Package.find({})
    if (!packages) {
        throw new ExpressError('could not retrieve any packages',404)
    }
    res.render('packages/index',{packages})
}))

// get package with specific id
router.get('/packages/:id',catchAsync(async (req,res,next) => {
    const { id } = req.params;
    const package = await Package.findById(id)
    if (!package) {
        throw new ExpressError('no package with that ID', 404)
    }
    res.render('packages/details',{package})
}))

//delete package under specific addy
router.delete('/addys/:addyId/packages/:packageId', isLoggedIn, catchAsync(async (req,res,next) => {
    const {packageId, addyId} = req.params;
    const package = await Package.findByIdAndDelete(packageId)
    const addy = await Addy.findByIdAndUpdate(addyId, {$pull: {packages: packageId}}).populate('packages').populate('reviews')
    // console.log('package deleted: ' + package)
    res.render('addys/details', {addy})
}))

// get form to create new package tied to addy
router.get('/addys/:id/packages/new', isLoggedIn, (req,res) => {
    const {id} = req.params
    res.render('packages/new', {id})
})


module.exports = router;
