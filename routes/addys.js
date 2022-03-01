const express = require("express");
const Addy = require('../models/addy')
const {validateAddy} = require('../utils/validations')
const {isLoggedIn} = require('../utils/middleware')
const catchAsync = require('../utils/catchAsync')
const router = express.Router();


// show all addys
router.get('/', catchAsync(async (req, res, next) => {
    const addys = await Addy.find({})
    if (!addys) {
        throw new ExpressError('could not retreive any addys', 404)
    }
    res.render('addys/index', { addys });
}))


// delete specific addy
router.delete('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findByIdAndDelete(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    }
    res.redirect('/addys')
}))

//get new addy form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('addys/new')
})

//post new addy
router.post('/', validateAddy, catchAsync(async (req, res, next) => {
    const addy = new Addy(req.body.addy)
    await addy.save()
    console.log('NEW DOCUMENT')
    console.log(addy)
    req.flash('success','succesfully created new addy')
    res.redirect(`/addys/${addy._id}`)
}))


// show details for specific addy
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id).populate('reviews').populate('packages')
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/addys')
    }
    res.render('addys/details', { addy })
}))

//update specific addy
router.patch('/:id', validateAddy, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, city } = req.body.addy;
    const addy = await Addy.findById(id)
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/addys')
    }
    addy.title = title;
    addy.city = city;
    await addy.save()
    console.log(title, city, id, addy)
    res.render('addys/details', { addy })
}))

//get edit form for specific addy
router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/addys')
    }
    res.render('addys/edit', { addy })
}))

module.exports = router;