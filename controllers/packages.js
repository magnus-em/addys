const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const Package = require('../models/package')
const Addy = require('../models/addy')

module.exports.createPackage = catchAsync(async(req,res,next) => {
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
})

module.exports.index = catchAsync(async(req,res,next) => {
    const packages = await Package.find({})
    if (!packages) {
        throw new ExpressError('could not retrieve any packages',404)
    }
    res.render('packages/index',{packages})
})

module.exports.showPackage = catchAsync(async (req,res,next) => {
    const { id } = req.params;
    const package = await Package.findById(id)
    if (!package) {
        throw new ExpressError('no package with that ID', 404)
    }
    res.render('packages/details',{package})
})

module.exports.deletePackage = catchAsync(async (req,res,next) => {
    const {packageId, addyId} = req.params;
    const package = await Package.findByIdAndDelete(packageId)
    const addy = await Addy.findByIdAndUpdate(addyId, {$pull: {packages: packageId}}).populate('packages').populate('reviews')
    // console.log('package deleted: ' + package)
    res.render('addys/details', {addy})
})

module.exports.renderNewForm = (req,res) => {
    const {id} = req.params
    res.render('packages/new', {id})
}