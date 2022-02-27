const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const Addy = require('./models/addy');
const Package = require('./models/package')
const catchAsync = require('./utils/catchAsync')
const validateAddy = require('./utils/validateAddy')
const ExpressError = require('./utils/ExpressError')

const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/devDb?retryWrites=true&w=majority';

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


app.get('/', (req, res) => {
    res.render('home');
})
app.get('/index', (req, res) => {
    res.render('home');
})

app.get('/faq', (req,res) => {
    res.render('faq')
})

app.get('/terms', (req,res) => {
    res.render('terms')
})

app.get('/privacy', (req,res) => {
    res.render('privacy')
})

app.get('/contact',(req,res) => {
    res.render('contact')
})

app.get('/requirements',(req,res) => {
    res.render('requirements')
})

app.get('/packages/new',(req,res) => {
    res.render('packages/new')
})

app.post('/packages', catchAsync(async (req,res,next) => {
    const package = new Package(req.body.package) // normally you would want to verify this with Joi 
    await package.save()
    res.redirect('/packages')
}))

app.get('/packages',catchAsync(async(req,res,next) => {
    const packages = await Package.find({})
    if (!packages) {
        throw new ExpressError('could not retrieve any packages',404)
    }
    res.render('packages/index',{packages})
}))

app.get('/packages/:id',catchAsync(async (req,res,next) => {
    const { id } = req.params;
    const package = await Package.findById(id)
    if (!package) {
        throw new ExpressError('no package with that ID', 404)
    }
    res.render('packages/details',{package})
}))

app.delete('/addys/:addyId/packages/:packageId', catchAsync(async (req,res,next) => {
    const {packageId, addyId} = req.params;
    const package = await Package.findByIdAndDelete(packageId)
    const addy = await Addy.findByIdAndUpdate(addyId, {$pull: {packages: packageId}}).populate('packages')
    // console.log('package deleted: ' + package)
    res.render('addys/details', {addy})

}))

// show all addys
app.get('/addys', catchAsync(async (req, res, next) => {
    const addys = await Addy.find({})
    if (!addys) {
        throw new ExpressError('could not retreive any addys', 404)
    }
    res.render('addys/index', { addys });
}))

app.get('/reshipper', catchAsync(async(req,res, next) => {
    res.render('reshipper')
}))

app.get('/addys/:id/packages/new', (req,res) => {
    const {id} = req.params
    res.render('packages/new', {id})
})

app.post('/addys/:id/packages', catchAsync(async(req,res,next) => {
    const {id} = req.params
    const addy = await Addy.findById(id).populate('packages')
    const package = new Package(req.body.package)
    await addy.packages.push(package)
    package.addy = addy;
    await addy.save()
    await package.save()
    res.render('addys/details', {addy})
}))


// delete
app.delete('/addys/:id', catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const addy = await Addy.findByIdAndDelete(id)
    if (!addy) {
        throw new ExpressError('no addy with that id', 404)
    }
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
    const addy = await Addy.findById(id).populate('packages')
    console.log('THE ADDY: '+ addy)
    if (!addy) {
        throw new ExpressError('No Addy with that ID', 404)
    }
    res.render('addys/details', { addy })
}))

app.patch('/addys/:id', validateAddy, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, city } = req.body.addy;
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
