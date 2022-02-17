const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const Addy = require('./models/addy');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')

const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';


mongoose.connect(uri)


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//set EJS
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

//static asset
app.use('/public', express.static('public'));

app.use(methodOverride('_method'));

function validateAddy(req,res,next) {
    const addySchema = Joi.object({
        addy: Joi.object({
            title: Joi.string().required(),
            city: Joi.string().required()
    })})

    const {error, value} = addySchema.validate(req.body)
    console.log(addySchema.validate(req.body))
    console.dir("joi error " + error)
    console.dir('joi value ' + value)
    if (error) {
        console.log('*****prerror')
        console.log(error.details)
        throw new ExpressError(error.details[0].message, 404)
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home');
})
app.get('/index', (req, res) => {
    res.render('home');
})

// show all addys
app.get('/addys', catchAsync(async (req, res, next) => {
    const addys = await Addy.find({})
    if (!addys) {
        throw new ExpressError('could not retreive any addys', 404)
    }
    res.render('addys/index', { addys });
}))

app.get('/reshipper', (req,res) => {
    res.render('reshipper')
})


// delete
app.delete('/addys/:id', catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const addy = await Addy.findByIdAndDelete(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    }
    console.log('delete addy: ', addy)
    res.redirect('/addys')
}))

//new addy form
app.get('/addys/new', (req, res) => {
    res.render('addys/new')
})

app.put('/addys', validateAddy, catchAsync(async (req, res, next) => {
    const addy = new Addy(req.body.addy)
    await addy.save()
    res.redirect(`/addys/${addy._id}`)
}))



// show details for specific addy
app.get('/addys/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
    if (!addy) {
        throw new new ExpressError('No Addy with that ID', 404)
    }
    res.render('addys/details', { addy })
}))

app.patch('/addys/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, city } = req.body;
    const addy = await Addy.findById(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    }
    addy.title = title;
    addy.city = city;
    addy.save()
    console.log(title, city, id, addy)
    res.render('addys/details', { addy })
}))

app.get('/addys/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const addy = await Addy.findById(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    }
    res.render('addys/edit', { addy })
}))

app.use((err, req, res, next) => {
    const { status = 501, message = 'something went very wrong' } = err
    console.log('MESSAGE: ' + message)
    param = {message}
    res.status(status).render('error', {param})

})

app.all('*', (req,res) => {
    res.status(404).render('notfound')
})

app.use((req, res) => {
    res.status(404).render('notfound')
})


const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('app listening on port' + port)
})
