if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize')
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const Package = require('./models/package')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const addyRoutes = require('./routes/addys')
const packageRoutes = require('./routes/packages')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const fwRoutes = require('./routes/forwarder')
const adminRoutes = require('./routes/admin')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

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
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(mongoSanitize())




const sessionConfig = {
    secret: 'demosecret', 
    resave: 'false', 
    saveUninitialized: 'false',
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24,
        maxAge: 100*60*60*24
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())






// put this in staticfiles.config
// option_settings:
//   aws:elasticbeanstalk:environment:proxy:staticfiles:
//     /public: /public
// //method override for html forms


//save any req.flash messages to res.locals (local variables available to views)
app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    res.locals.user = req.user;
    res.locals.title = 'Addys: US residential addresses for global package forwarding'
    res.locals.description = 'Addys offers fast and reliable, global package forwarding from real US residential addresses. Scale your resale business with Addys.'
    next();
})

app.use('/addys',addyRoutes)
app.use('/',packageRoutes)
app.use('/addys/:addyId/reviews',reviewRoutes)
app.use('/', userRoutes)
app.use('/forwarder', fwRoutes)
app.use('/admin', adminRoutes)


app.get('/', (req, res) => {
    res.render('home');
})



app.get('/index', (req, res) => {
    res.render('home');
})
app.get('/faq', (req,res) => {
    res.render('details/faq')
})
app.get('/cookies',(req,res) => {
    res.render('details/cookies')
})
app.get('/terms', (req,res) => {
    res.render('details/terms')
})
app.get('/privacy', (req,res) => {
    res.render('details/privacy')
})

app.get('/disclaimer', (req,res) => {
    res.render('details/disclaimer')
})

app.get('/contact',(req,res) => {
    res.render('contact')
})
app.get('/requirements',(req,res) => {
    res.render('requirements')
})
app.get('/reshipper', catchAsync(async(req,res, next) => {
    res.render('reshipper')
}))

app.get("/sitemap.xml", function(req, res, next){
    res.sendFile(__dirname + '/public/assets/sitemap.xml'); 
  })
  app.get("/robots.txt", function(req, res, next){
    res.sendFile(__dirname + '/public/assets/robots.txt'); 
  })

app.use((err, req, res, next) => {
    const { status = 501, message = 'something went very wrong' } = err
    console.log('MESSAGE: ' + message)
    console.error('STACK: ' + err.stack)
    param = {message}
    res.status(status).render('details/error', {param})
})

// app.all('*', (req,res) => {
//     res.status(404).render('notfound')
// })

app.use((req, res) => {
    res.status(404).render('details/notfound')
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('app listening on port' + port)
})
