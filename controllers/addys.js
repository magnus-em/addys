const Addy = require('../models/addy')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')

//show all addys
module.exports.index = catchAsync(async (req, res) => {
    res.locals.title = 'Addys - Browse Locations'
    res.locals.description = 'See all addresses available for package forwarding'

    const addys = await Addy.find({})
    if (!addys) {
        throw new ExpressError('could not retreive any addys', 404)
    }
    res.render('addys/index', { addys });
})

module.exports.renderNewform = (req, res) => {
    res.render('addys/new')
}

module.exports.renderEditForm = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/locations')
    }
    res.render('addys/edit', { addy })
})

module.exports.createAddy = catchAsync(async (req,res) => {
    const addy = new Addy(req.body.addy)
    addy.forwarder = req.user._id
    await addy.save()
    console.log('NEW DOCUMENT')
    console.log(addy)
    req.flash('success','succesfully created new addy')
    res.redirect(`/locations/${addy._id}`)
})

module.exports.showAddy = catchAsync(async (req, res, next) => {
    res.locals.title = 'Addy Details'
    res.locals.description = 'See more information and reviews about this Addy'
    const { id } = req.params;
    const addy = await Addy.findById(id)
                        .populate({
                            path: 'reviews',
                            populate: {
                                path: 'author'
                            }
                        })
                        .populate({
                            path:'packages',
                            populate: {
                                path: 'images'
                            }
                        })
                        .populate('forwarder')
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/locations')
    }
    console.log('SHOW ADDY DETAILS')
    console.log(addy)
    res.render('addys/details', { addy })
})

module.exports.updateAddy = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, city } = req.body.addy;
    const addy = await Addy.findById(id)
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/locations')
    }
    addy.title = title;
    addy.city = city;
    await addy.save()
    console.log(title, city, id, addy)
    res.render('addys/details', { addy })
})

module.exports.deleteAddy = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    } 
    await addy.delete()
    req.flash('success','Addy deleted')
    res.redirect('/locations')
})

module.exports.showInbox = catchAsync(async (req,res) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
                        .populate({
                            path:'packages',
                            populate: {
                                path: 'images'
                            }
                        })
                        .populate('forwarder')
    if (!addy) {
        req.flash('error','No Addy with that ID')
        return res.redirect('/locations')
    }
    res.render('users/inbox', {addy})
})